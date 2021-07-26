const mongoose = require('mongoose');

const assignBusToScheduleSchema = new mongoose.Schema({
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule'
    },
    bus: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bus',
    },
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false
});

export default mongoose.model('AssignBusToSchedule', assignBusToScheduleSchema, 'assignBusToSchedules');