const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');

router.get('/', async (req, res) => {
    try {
        const photos = await Photo.find()
            .sort({ uploadDate: -1 })
            .limit(5);
        res.json(photos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', async (req, res) => {
    try {
        if (!req.body.imageData) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        const photo = new Photo({
            imageData: req.body.imageData,
            metadata: req.body.metadata
        });

        const newPhoto = await photo.save();
        
        const photos = await Photo.find()
            .sort({ uploadDate: -1 })
            .limit(5);
            
        req.app.get('io').emit('newPhoto', photos);
        
        res.status(201).json({ 
            status: 'success',
            id: newPhoto._id
        });
    } catch (error) {
        console.error('Error saving photo:', error);
        res.status(400).json({ 
            status: 'error',
            message: error.message 
        });
    }
});

module.exports = router;
