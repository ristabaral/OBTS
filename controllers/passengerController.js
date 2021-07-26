import { Passenger } from '../models';
import { CustomErrorHandler } from '../services';
import { passengerSchema } from '../validators';

const passengerController = {
    async index(req, res, next) {
        let documents;
        // Pagination.mongoose-pagination
        try {
            documents = await Passenger.find().select('-__v -updatedAt').sort({ _id: -1 });
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    },

    async store(req, res, next) {
        // Validation
        const { error } = passengerSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { name, age, gender } = req.body;

        let document;

        try {
            document = await Booker.create({ name, age, gender });

        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    },

    async update(req, res, next) {
        console.log(req.body)
            // Validation
        const { error } = passengerSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { name, age, gender } = req.body;

        let document;

        try {
            document = await Passenger.findOneAndUpdate({ _id: req.params.id }, { name, age, gender }, { new: true });

        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    },

    async show(req, res, next) {
        let document;
        try {
            document = await Passenger.findOne({ _id: req.params.id }).select('-__v -updatedAt');
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(document);
    },

    async destroy(req, res, next) {
        const document = await Passenger.findOneAndRemove({ _id: req.params.id });

        if (!document) return next(new Error('Nothing to delete!'));

        return res.json(document);
    }
}

export default passengerController;