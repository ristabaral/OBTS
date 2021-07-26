import { AssignBus, AssignBusToSchedule, AssignCheckpoint, AssignSchedule, Checkpoint, Schedule, Bus } from '../models';
import { CustomErrorHandler } from '../services';
import { scheduleSchema } from '../validators';
import moment from 'moment';
import mongoose from 'mongoose';

const scheduleController = {
    async index(req, res, next) {
        let documents;
        // Pagination.mongoose-pagination
        try {
            documents = await Schedule.find().select('-__v -updatedAt').sort({ _id: -1 });
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        res.render('schedules/index');
        // return res.json(documents);
    },

    async store(req, res, next) {
        console.log(req.body);
        // Validation
        const { error } = scheduleSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { depart, arrival, departTime, arrivalTime, pickup, dropoff, price, bus, checkpoints } = req.body;
        pickup = pickup.toLowerCase();
        dropoff = dropoff.toLowerCase();
        depart = moment(depart).format('YYYY-MM-DD');
        arrival = moment(arrival).format('YYYY-MM-DD');

        console.log('here', checkpoints)
        let document;
        let scheduleList = [];

        try {
            document = await Schedule.create({ depart, arrival, departTime, arrivalTime, pickup, dropoff, price });

            // After we create schedule and assign a bus to it, set bus status to scheduled
            const busData = await Bus.findOne({ _id: bus });
            busData.scheduled = true;
            await busData.save();

            // Assign schedule to operator
            let assignSchedule = await AssignSchedule.findOne({ operator: req.user._id });
            if (assignSchedule) {
                assignSchedule.schedules.push(document._id);
                await assignSchedule.save();
            } else {
                scheduleList.push(document._id);
                await AssignSchedule.create({ schedules: scheduleList, operator: req.user._id });
            }
        } catch (err) {
            return next(err);
        }

        // Assign Bus to the schedule
        // if (bus != 'null') {
        let ab;
        try {
            ab = await AssignBusToSchedule.findOne({ schedule: document._id });
            if (ab) {
                ab.bus = bus;
                await ab.save();
            } else {
                await AssignBusToSchedule.create({ schedule: document._id, bus });
            }
        } catch (err) {
            return next(err);
        }
        // }


        // Assign checkpoints to shcedule
        let chkList = [];
        checkpoints.forEach(c => {
            c = mongoose.Types.ObjectId(c);
            chkList.push(c);
        });

        await AssignCheckpoint.create({ schedule: document._id, checkpoints: chkList });

        res.redirect('/api/dashboard/schedules');
        // res.status(201).json(document);
    },

    async update(req, res, next) {
        console.log(req.body)
            // Validation
        const { error } = scheduleSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { depart, arrival, departTime, arrivalTime, pickup, dropoff, price, checkpoints } = req.body;
        depart = moment(depart).format('YYYY-MM-DD');
        arrival = moment(arrival).format('YYYY-MM-DD');
        pickup = pickup.toLowerCase();
        dropoff = dropoff.toLowerCase();

        let document;

        try {
            document = await Schedule.findOneAndUpdate({ _id: req.params.id }, { depart, departTime, depart, arrivalTime, pickup, dropoff, price }, { new: true });

        } catch (err) {
            return next(err);
        }

        // Assign checkpoints to shcedule
        const assignCheckpoint = await AssignCheckpoint.findOne({ schedule: document._id });

        let chkList = [];
        checkpoints.forEach(c => {
            console.log('c', c)
            c = mongoose.Types.ObjectId(c);
            chkList.push(c);
        });

        assignCheckpoint.checkpoints = chkList;
        await assignCheckpoint.save();

        // chkList.forEach(async c => {
        //     if (!chkptList.includes(c)) {
        //         console.log('here', c)
        //         assignCheckpoint.checkpoints.push(c);
        //         await assignCheckpoint.save();
        //     }
        // });
        return res.redirect('/api/dashboard/schedules');
        // res.status(201).json(document);
    },

    async show(req, res, next) {
        let document;
        try {
            document = await Schedule.findOne({ _id: req.params.id }).select('-__v -updatedAt');
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(document);
    },

    async destroy(req, res, next) {
        const document = await Schedule.findOneAndRemove({ _id: req.params.id });

        if (!document) return next(new Error('Nothing to delete!'));

        let assignSchedule = await AssignSchedule.findOne({ operator: req.user._id });
        if (assignSchedule.schedules.length > 0) {
            var index = assignSchedule.schedules.indexOf(req.params.id);
            if (index > -1) {
                assignSchedule.schedules.splice(index, 1);
            }
            await assignSchedule.save();
        } else {
            return next(new Error('Nothing to delete!'));
        }


        let abs = await AssignBusToSchedule.findOne({ schedule: req.params.id });
        if (abs) await abs.remove();

        let bus = await Bus.findOne({ _id: abs.bus });
        bus.scheduled = false;

        await bus.save();



        return res.redirect('/api/dashboard/schedules');

        // return res.json(document);
    },

    async search(req, res, next) {
        const { pickup, dropoff, depart } = req.body;
        const schedules = await Schedule.find({ pickup, dropoff, depart });
        console.log(schedules)
        res.render('chooseRoute', { schedules });
        // res.redirect('/api/availableroutes',{schedules})
    },

    async addschedulePage(req, res, next) {
        let busData;
        let buses = [];
        const checkpoints = await Checkpoint.find();
        const assignBus = await AssignBus.findOne({ operator: req.user._id }).select('-__v -updatedAt').sort({ _id: -1 });
        if (assignBus) {
            if (assignBus.buses.length > 0) {
                const mappedArr = assignBus.buses.map(async bus => await Bus.findOne({ _id: bus }));
                busData = await Promise.all(mappedArr);
                console.log('this', busData)
                busData.forEach(bus => {
                    if (bus.scheduled == false) {
                        buses.push(bus);
                    }
                })
            } else {
                return res.render('schedules/index', { operator, buses });
                // return next(CustomErrorHandler.serverError('Operator has no buses!'));
            }
        } else {
            return res.render('schedules/index', { operator, documents, buses });
            // res.render('schedules/create', { checkpoints, buses });
        }
        console.log('buses', buses)
        return res.render('schedules/create', { buses, checkpoints });
    },

    async updatePage(req, res, next) {
        const schedule = await Schedule.findOne({ _id: req.params.id });
        const checkpoints = await Checkpoint.find();
        const ac = await AssignCheckpoint.findOne({ schedule: schedule._id });
        const myCheckpoints = ac.checkpoints;
        const checked = true;
        res.render('schedules/update', { schedule, checkpoints, myCheckpoints, checked });
    }
};

// async function assigncheckpoint(req, res, next) {
//     let { checkpoints } = req.body;
//     let chkList = [];
//     checkpoints.forEach(c => {
//         c = mongoose.Types.ObjectId(c);
//         chkList.push(c);
//     });

//     let newData;

//     try {
//         const assignCheckpoint = await AssignCheckpoint.findOne({ schedule: document._id });
//         if (!assignCheckpoint) {
//             newData = await AssignCheckpoint.create({ checkpoints: chkList, schedule: document._id });
//         } else {
//             let chkptList = assignCheckpoint.checkpoints;
//             chlist.forEach(async c => {
//                 if (!chkptList.includes(c)) {
//                     assignCheckpoint.checkpoints.push(c);
//                     await assignCheckpoint.save()
//                 }
//             });
//         }
//     } catch (err) {
//         return next(err);
//     }
//     console.log('list', chkList)
//     console.log('assignchek', assignCheckpoint)
// }

export default scheduleController;