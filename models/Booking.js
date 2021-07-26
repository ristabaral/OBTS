import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
    bus: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    },
    booker: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booker'
    },
    schedule: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule'
    },
    checkpoint: {
        required: true,
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checkpoint'
    },
    noOfSeats: {
        required: true,
        type: Number,
    },
    amount: {
        required: true,
        type: Number
    },
    paymentStatus: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema, 'bookings');