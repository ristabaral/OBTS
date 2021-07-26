import { AssignBus, Bus, Conductor } from '../models';
import { CustomErrorHandler } from '../services';
import { conductorSchema } from '../validators';
import mongoose from 'mongoose';

const conductorController = {
    async index(req, res, next) {
        let documents;
        // Pagination.mongoose-pagination
        try {
            documents = await Conductor.find().select('-__v -updatedAt').sort({ _id: -1 });
            const mappedArr = documents.map(async doc => {
                const { busName, busNo } = await Bus.findOne({ _id: doc.bus });
                const { _id, name, phone, bus } = doc;
                return { _id, busName, busNo, name, phone, bus };
            })
            documents = await Promise.all(mappedArr);
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }

        return res.render('conductors/index', { documents });
        // return res.json(documents);
    },

    async store(req, res, next) {
        // Validation
        const { error } = conductorSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { name, phone, bus } = req.body;
        bus = mongoose.Types.ObjectId(bus);
        const operator = req.user._id;

        let document;

        try {
            document = await Conductor.create({ name, phone, bus, operator });

        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    },

    async update(req, res, next) {
        // Validation
        const { error } = conductorSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { name, phone, bus } = req.body;
        bus = mongoose.Types.ObjectId(bus);
        let operator = req.user._id;

        let document;

        try {
            document = await Conductor.findOneAndUpdate({ _id: req.params.id }, { name, phone, bus, operator }, { new: true });

        } catch (err) {
            return next(err);
        }

        res.redirect('/api/dashboard/conductors');
        // res.status(201).json(document);
    },

    async show(req, res, next) {
        let document;
        try {
            document = await Conductor.findOne({ _id: req.params.id }).select('-__v -updatedAt');
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(document);
    },

    async destroy(req, res, next) {
        const document = await Conductor.findOneAndRemove({ _id: req.params.id });

        if (!document) return next(new Error('Nothing to delete!'));

        return res.json(document);
    },

    async createPage(req, res, next) {
        const ab = await AssignBus.findOne({ operator: req.user._id });
        const mappedArr = ab.buses.map(async bus => {
            const { _id, busName, busNo } = await Bus.findOne({ _id: bus });
            return { _id, busName, busNo };
        })
        const buses = await Promise.all(mappedArr);
        res.render('conductors/create', { buses });
    },

    async updatePage(req, res, next) {
        const conductor = await Conductor.findOne({ _id: req.params.id });

        const ab = await AssignBus.findOne({ operator: req.user._id });
        const mappedArr = ab.buses.map(async bus => {
            const { _id, busName, busNo } = await Bus.findOne({ _id: bus });
            return { _id, busName, busNo };
        })
        const buses = await Promise.all(mappedArr);
        res.render('conductors/update', { conductor, buses });
    }
}

export default conductorController;