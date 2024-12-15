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
    embedding: {
        type: [Number],  // 512-мерный вектор
        required: false,
        default: null,
        index: true  // для быстрого поиска
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('UserImage', userImageSchema);