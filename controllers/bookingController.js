import { Booker, Booking, Bus, Checkpoint } from '../models';
import { CustomErrorHandler } from '../services';
import { bookingSchema } from '../validators';
import mongoose from 'mongoose';

const bookingController = {
    async index(req, res, next) {
        let documents;
        var perPage = 5;
        var page = req.params.page || 1;
        // Pagination.mongoose-pagination
        try {
            const bookings = await Booking.find().select('-__v -updatedAt').sort({ _id: -1 });

            const mappedArr = bookings.map(async b => {
                const { busNo, busName } = await Bus.findOne({ _id: b.bus });

                const { name } = await Booker.findOne({ _id: b.booker });

                var date = (b.createdAt).toString().split('G')[0];
                const { checkpoint } = await Checkpoint.findOne({ _id: b.checkpoint });
                return { _id: b._id, amount: b.amount, status: b.paymentStatus, noOfSeats: b.noOfSeats, schedule: b.schedule, name, checkpoint, busName, busNo, date };
            });
            documents = await Promise.all(mappedArr);
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.render('allBookings', { documents, current: page, pages: Math.ceil(documents.length / perPage), message: req.flash('message') });
    },

    async store(req, res, next) {
        // Validation
        const { error } = bookingSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { booker, schedule, bus, checkpoint, numOfSeats, amount } = req.body;
        bus = mongoose.Types.ObjectId(bus);
        operator = req.user._id;

        let document;

        try {
            document = await Booking.create({ booker, schedule, bus, checkpoint, numOfSeats, amount, operator });

        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    },

    async update(req, res, next) {
        console.log(req.body)
            // Validation
        const { error } = bookingSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        let { booker, schedule, bus, checkpoint, numOfSeats, amount, operator } = req.body;
        bus = mongoose.Types.ObjectId(bus);
        operator = req.user._id;

        let document;

        try {
            document = await Conductor.findOneAndUpdate({ _id: req.params.id }, { booker, schedule, bus, checkpoint, numOfSeats, amount, operator }, { new: true });

        } catch (err) {
            return next(err);
        }

        res.status(201).json(document);
    },

    async show(req, res, next) {
        let document;
        try {
            document = await Booking.findOne({ _id: req.params.id }).select('-__v -updatedAt');
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(document);
    },

    async destroy(req, res, next) {
        const document = await Booking.findOneAndRemove({ _id: req.params.id });

        if (!document) return next(new Error('Nothing to delete!'));
        req.flash('message', 'delete successful');
        return res.redirect('/api/dashboard/bookings/1');
        // return res.json(document);
    }
}

export default bookingController;