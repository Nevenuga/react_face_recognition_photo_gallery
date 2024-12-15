const express = require('express');
const router = express.Router();
const Photo = require('../models/Photo');
const UserImage = require('../models/UserImage');
const { cosineSimilarity } = require('../utils/embeddingUtils');

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

        const embedding = Array.isArray(req.body.metadata) ? req.body.metadata : [];
        console.log('Received embedding:', embedding.slice(0, 5), '...');
        let matchFound = false;
        let maxSimilarity = 0;
        if (embedding.length > 0) {
            const userImages = await UserImage.find({});
            console.log('Found userImages:', userImages.length);
            for (const userImage of userImages) {
                if (userImage.embedding) {
                    const similarity = cosineSimilarity(embedding, userImage.embedding);
                    maxSimilarity = Math.max(maxSimilarity, similarity);
                    if (similarity > 80) {
                        matchFound = true;
                    }
                }
            }
        }

        const photo = new Photo({
            imageData: req.body.imageData,
            embedding: embedding,
            matchFound,
            similarity: maxSimilarity
        });

        const newPhoto = await photo.save();
        
        const photos = await Photo.find()
            .sort({ uploadDate: -1 })
            .limit(5);
            
        req.app.get('io').emit('newPhoto', photos);
        
        res.status(201).json({ 
            status: 'success',
            id: newPhoto._id,
            matchFound,
            similarity: maxSimilarity
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