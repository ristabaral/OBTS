import mongoose, { Mongoose } from 'mongoose';
const Schema = mongoose.Schema;

const passengerSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    seat: {
        type: String,
        required: true
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Passenger', passengerSchema, 'passengers');