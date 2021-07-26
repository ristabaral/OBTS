const mongoose = require('mongoose');

const checkpointSchema = new mongoose.Schema({
    checkpoint: {
        type: String,
        unique: true,
        required: true
    },
}, { timestamps: true });

export default mongoose.model('Checkpoint', checkpointSchema, 'checkpoints');