const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    depart: {
        type: String,
        required: true
    },
    arrival: {
        type: String,
        required: true
    },
    departTime: {
        type: String,
        required: true
    },
    arrivalTime: {
        type: String,
        required: true
    },
    pickup: {
        type: String,
        required: true
    },
    dropoff: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

export default mongoose.model('Schedule', scheduleSchema, 'schedules');