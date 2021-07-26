const mongoose = require('mongoose');

const assignBusSchema = new mongoose.Schema({
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    buses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus'
    }],
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false
});

export default mongoose.model('AssignBus', assignBusSchema, 'assignBuses');