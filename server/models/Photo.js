const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
    imageData: {
        type: String,
        default: ''  
    },
    metadata: {
        type: Object,
        default: {}
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Photo', photoSchema);
