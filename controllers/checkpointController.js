import { AssignBus, Bus, Checkpoint, Schedule } from '../models';
import { CustomErrorHandler } from '../services';
import { checkpointSchema } from '../validators';

const checkpointController = {
    async index(req, res, next) {
        let documents;
        // Pagination.mongoose-pagination
        try {
            documents = await Checkpoint.find().select('-__v -updatedAt').sort({ _id: -1 });
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.render('checkpoints/index', { documents });
        // return res.json(documents);
    },

    async store(req, res, next) {
        // Validation
        const { error } = checkpointSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { checkpoint } = req.body;

        let document;

        try {
            document = await Checkpoint.create({ checkpoint });

        } catch (err) {
            return next(err);
        }

        return res.redirect('/api/dashboard/checkpoints');
        // res.status(201).json(document);
    },

    async update(req, res, next) {
        console.log(req.body)
            // Validation
        const { error } = checkpointSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { checkpoint } = req.body;

        let document;

        try {
            document = await Checkpoint.findOneAndUpdate({ _id: req.params.id }, { checkpoint }, { new: true });

        } catch (err) {
            return next(err);
        }
        return res.redirect('/api/dashboard/checkpoints');
        // res.status(201).json(document);
    },

    async show(req, res, next) {
        let document;
        try {
            document = await Checkpoint.findOne({ _id: req.params.id }).select('-__v -updatedAt');
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(document);
    },

    async destroy(req, res, next) {
        const document = await Checkpoint.findOneAndRemove({ _id: req.params.id });

        if (!document) return next(new Error('Nothing to delete!'));

        return res.redirect('/api/dashboard/checkpoints');
        // return res.json(document);
    },

    addcheckpointPage(req, res, next) {
        res.render('checkpoints/create');
    },

    async updatePage(req, res, next) {
        const checkpoint = await Checkpoint.findOne({ _id: req.params.id });
        console.log(checkpoint)
        res.render('checkpoints/update', { checkpoint });
    }
}

export default checkpointController;