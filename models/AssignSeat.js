// Assign seats to bus
const mongoose = require('mongoose');

const assignSeatSchema = new mongoose.Schema({
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    },
    seats: [{
        number: String,
        status: {
            type: Boolean,
            default: true
        }
    }],
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false
});

export default mongoose.model('AssignSeat', assignSeatSchema, 'assignSeats');