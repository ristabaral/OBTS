import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const seatSchema = new Schema({
    status: {
        type: Boolean,
        default: true //true means available
    },
    number: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Seat', seatSchema, 'seats');