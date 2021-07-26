const mongoose = require('mongoose');

const ConductorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    },
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
}, { timestamps: true });

export default mongoose.model('Conductor', ConductorSchema, 'conductors');