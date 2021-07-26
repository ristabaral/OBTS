const mongoose = require('mongoose');

const assignCheckpointSchema = new mongoose.Schema({
    schedule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Schedule'
    },
    checkpoints: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Checkpoint'
    }],
}, {
    timestamps: true,
    toJSON: { getters: true },
    id: false
});

export default mongoose.model('AssignCheckpoint', assignCheckpointSchema, 'assignCheckpoints');