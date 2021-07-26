const mongoose = require('mongoose');
import { APP_URL } from '../config';

const busSchema = new mongoose.Schema({
    busNo: {
        type: String,
        required: true
    },
    busName: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    numOfSeats: {
        type: Number,
        default: 45
    },
    scheduled: {
        type: Boolean,
        default: false
    },
    image: {
        type: String,
        required: true,
        get: (image) => {
            return `${APP_URL}/${image}`
        }
    }
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false
});

export default mongoose.model('Bus', busSchema, 'buses');