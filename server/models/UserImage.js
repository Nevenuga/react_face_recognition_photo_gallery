const mongoose = require('mongoose');

const userImageSchema = new mongoose.Schema({
    imageData: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['webcam', 'upload'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserImage', userImageSchema);
