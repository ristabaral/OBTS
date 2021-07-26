import { AssignBusToSchedule, AssignSchedule, Bus, Schedule, User } from '../models';
var mongoose = require('mongoose');
import { CustomErrorHandler } from '../services';

const assignScheduleController = {
    async index(req, res, next) {
        let documents = [];
        let scheduleList = [];
        let operator, abs, bus, doc, result;
        // Pagination.mongoose-pagination
        try {
            const assignSchedule = await AssignSchedule.findOne({ operator: req.user._id }).select('-__v -updatedAt').sort({ _id: -1 });
            operator = await User.findOne({ _id: req.user._id }).select('-__v -updatedAt');
            if (assignSchedule) {
                scheduleList = assignSchedule.schedules;
                if (scheduleList.length > 0) {
                    const mappedArr = scheduleList.map(async sch => {
                        const { _id, depart, arrival, departTime, arrivalTime, pickup, dropoff, price } = await Schedule.findOne({ _id: sch });

                        const { schedule, bus } = await AssignBusToSchedule.findOne({ schedule: sch }).select('-__v  -updatedAt');

                        const { busName } = await Bus.findOne({ _id: bus });

                        return { _id, depart, arrival, pickup, departTime, arrivalTime, dropoff, price, schedule, bus, busName };
                    })
                    documents = await Promise.all(mappedArr);
                } else {
                    return res.render('schedules/index', { documents, operator });
                    // return next(CustomErrorHandler.serverError('Operator has no Schdeules!'));
                }
            } else {
                return res.render('schedules/index', { documents, operator });
                // return next(CustomErrorHandler.serverError('Operator has no schdeules!'));
            }
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.render('schedules/index', { documents, operator });
        // return res.json({ operator, schedules: documents });
    },

    async store(req, res, next) {
        let schedules = [];
        let { schedule } = req.body;
        schedule = mongoose.Types.ObjectId(schedule);
        const operator = req.user._id;

        let document;

        try {
            const assignSchedule = await AssignSchedule.findOne({ operator });
            if (!assignSchedule) {
                schedules.push(schedule);
                document = await AssignSchedule.create({ schedules, operator });
            } else {
                let scheduleList = assignSchedule.schedules;
                if (!scheduleList.includes(schedule)) {
                    assignSchedule.schedules.push(schedule);
                    document = assignSchedule;
                    await assignSchedule.save()
                } else {
                    return next(CustomErrorHandler.alreadyExist('Schedule already exists!'));
                }
            }
        } catch (err) {
            return next(err);
        }
        res.status(201).json(document);
    },

    // async show(req, res, next) {
    //     let document;
    //     try {
    //         document = await AssignBus.findOne({ operator: req.user._id }).select('-__v -updatedAt');
    //     } catch (err) {
    //         return next(CustomErrorHandler.serverError());
    //     }
    //     return res.status(200).json(document);
    // },

    async destroy(req, res, next) {
        let document;
        try {
            document = await AssignSchedule.findOne({ operator: req.user._id }).select('-__v -updatedAt');

            if (!document) return next(new Error('Nothing to delete!'));

            if (document.schedules.length > 0) {
                var index = document.schedules.indexOf(req.params.scheduleId);
                if (index > -1) {
                    document.schedules.splice(index, 1);
                }
                await document.save();
            } else {
                return next(new Error('Nothing to delete!'));
            }
        } catch (err) {
            return next(err);
        }

        return res.json(document);
    }
}

export default assignScheduleController;