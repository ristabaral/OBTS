import { Bus, AssignBus, User } from '../models';
var mongoose = require('mongoose');
import { CustomErrorHandler } from '../services';

const assignBusController = {
    async index(req, res, next) {
        let documents = [];
        let operator;
        // let document;
        // Pagination.mongoose-pagination
        try {
            operator = await User.findOne({ _id: req.user._id }).select('-__v -updatedAt');
            const assignBus = await AssignBus.findOne({ operator: req.user._id }).select('-__v -updatedAt').sort({ _id: -1 });
            if (assignBus) {
                if (assignBus.buses.length > 0) {
                    const mappedArr = assignBus.buses.map(async bus => await Bus.findOne({ _id: bus }))
                    documents = await Promise.all(mappedArr);
                } else {
                    return res.render('bus/index', { operator, documents })

                    // return next(CustomErrorHandler.serverError('Operator has no buses!'));
                }
            } else {
                return res.render('bus/index', { operator, documents })

                // return next(CustomErrorHandler.serverError('Operator has no buses!'));
            }
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        console.log(documents)
        return res.render('bus/index', { operator, documents })
            // return res.json({ operator, buses: documents });
    },

    async store(req, res, next) {
        let buses = [];
        let { bus } = req.body;
        bus = mongoose.Types.ObjectId(bus);
        const operator = req.user._id;

        let document;

        try {
            const assignBus = await AssignBus.findOne({ operator });
            if (!assignBus) {
                buses.push(bus);
                document = await AssignBus.create({ buses, operator });
            } else {
                let busList = assignBus.buses;
                if (!busList.includes(bus)) {
                    assignBus.buses.push(bus);
                    document = assignBus;
                    await assignBus.save()
                } else {
                    return next(CustomErrorHandler.alreadyExist('Bus already exists!'));
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
            document = await AssignBus.findOne({ operator: req.user._id }).select('-__v -updatedAt');

            if (!document) return next(new Error('Nothing to delete!'));

            if (document.buses.length > 0) {
                var index = document.buses.indexOf(req.params.busId);
                if (index > -1) {
                    document.buses.splice(index, 1);
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

export default assignBusController;