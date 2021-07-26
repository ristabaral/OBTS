const mongoose = require('mongoose');

const assignScheduleSchema = new mongoose.Schema({
    operator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    schedules: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule'
    }],
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false
});

export default mongoose.model('AssignSchedule', assignScheduleSchema, 'assignSchedules');