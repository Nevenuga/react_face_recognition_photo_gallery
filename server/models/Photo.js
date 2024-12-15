const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    imageData: {
        type: String,
        default: ''  
    },
    embedding: {
        type: [Number],  // Массив чисел для эмбеддинга
        default: []
    },
    matchFound: {
        type: Boolean,
        default: false
    },
    similarity: {
        type: Number,
        default: 0
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Photo', photoSchema);