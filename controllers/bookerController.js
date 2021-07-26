import { Booker } from '../models';
import { CustomErrorHandler } from '../services';
import { bookerSchema } from '../validators';

const bookerController = {
    async index(req, res, next) {
        let documents;
        // Pagination.mongoose-pagination
        try {
            documents = await Booker.find().select('-__v -updatedAt').sort({ _id: -1 });
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },

    async store(req, res, next) {
        // Validation
        const { error } = bookerSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { name, email, phone } = req.body;

        let document;

        try {
            document = await Booker.create({ name, email, phone });

        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    },

    async update(req, res, next) {
        console.log(req.body)
            // Validation
        const { error } = bookerSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { name, email, phone } = req.body;

        let document;

        try {
            document = await Booker.findOneAndUpdate({ _id: req.params.id }, { name, email, phone }, { new: true });

        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    },

    async show(req, res, next) {
        let document;
        try {
            document = await Booker.findOne({ _id: req.params.id }).select('-__v -updatedAt');
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(document);
    },

    async destroy(req, res, next) {
        const document = await Booker.findOneAndRemove({ _id: req.params.id });

        if (!document) return next(new Error('Nothing to delete!'));

        return res.json(document);
    }
}

export default bookerController;