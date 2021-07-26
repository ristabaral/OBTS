var mongoose = require('mongoose');
import { CustomErrorHandler } from '../services';
import { AssignCheckpoint, Checkpoint, Schedule } from '../models';

const assignCheckpointController = {
    async index(req, res, next) {
        let documents = [];
        let schedule;
        // Pagination.mongoose-pagination
        try {
            const assignCheckpoint = await AssignCheckpoint.findOne({ schedule: req.params.scheduleId }).select('-__v -updatedAt');
            schedule = await Schedule.findOne({ _id: req.params.scheduleId }).select('-__v -updatedAt');
            if (assignCheckpoint) {
                if (assignCheckpoint.checkpoints.length > 0) {
                    const mappedArr = assignCheckpoint.checkpoints.map(async sch => await Checkpoint.findOne({ _id: sch }))
                    documents = await Promise.all(mappedArr);
                } else {
                    return next(CustomErrorHandler.notFound('Schedule has no set checkpoints!'))
                }
            } else {
                return next(CustomErrorHandler.notFound('No checkpoints have been assigned to this schedule!'))
            }
            // busList = operator.buses;
            console.log(assignCheckpoint)

            documents = await Checkpoint.find({ _id: assignCheckpoint.checkpoints.forEach(c => { return c; }) });

        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json({ schedule, checkpoints: documents });
    },

    async store(req, res, next) {
        console.log('now')
        let { checkpoints } = req.body;
        let { scheduleId } = req.params;
        checkpoints = checkpoints.toString();
        let chlist = checkpoints.split(',');
        let chkList = [];
        chlist.forEach(c => {
            c = mongoose.Types.ObjectId(c);
            chkList.push(c);
        });

        let document;

        try {
            const assignCheckpoint = await AssignCheckpoint.findOne({ schedule: scheduleId });
            if (!assignCheckpoint) {
                scheduleId = mongoose.Types.ObjectId(scheduleId);
                document = await AssignCheckpoint.create({ checkpoints: chkList, schedule: scheduleId });
            } else {
                let chkptList = assignCheckpoint.checkpoints;
                chlist.forEach(async c => {
                    if (!chkptList.includes(c)) {
                        assignCheckpoint.checkpoints.push(c);
                        await assignCheckpoint.save()
                    }
                });
            }
        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    },

    async destroy(req, res, next) {
        let document;
        try {
            document = await AssignCheckpoint.findOne({ schedule: req.params.scheduleId }).select('-__v -updatedAt');

            var index = document.checkpoints.indexOf(req.params.checkpointId);
            if (index > -1) {
                document.checkpoints.splice(index, 1);
            }
            await document.save();

            if (!document) return next(new Error('Nothing to delete!'));

        } catch (err) {
            return next(err);
        }

        return res.json(document);
    }
}

export default assignCheckpointController;