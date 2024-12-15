const express = require('express');
const router = express.Router();
const UserImage = require('../models/UserImage');
const cors = require('cors');
const { CLIENT_URL } = require('../server_config');
const { processImage } = require('../middleware/imageProcessing');

router.use(cors({
    origin: CLIENT_URL,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
}));

router.post('/upload-image', async (req, res) => {
    try {
        const { imageData, type } = req.body;
        
        if (!imageData) {
            return res.status(400).json({ message: 'No image data provided' });
        }

        // Получаем эмбеддинг из Python
        const { success, embedding, error } = await processImage(imageData);
        
        if (!success) {
            console.error('Error processing image:', error);
            // Даже если не удалось получить эмбеддинг, все равно сохраняем изображение
        }

        const newImage = new UserImage({
            imageData,
            type,
            embedding: embedding || null
        });

        await newImage.save();

        const latestImages = await UserImage.find({}, '_id type createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        req.app.get('io').emit('newUserPhoto', latestImages);

        res.status(201).json({ 
            message: 'Image uploaded successfully',
            imageId: newImage._id,
            hasEmbedding: !!embedding
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

router.get('/images', async (req, res) => {
    try {
        const images = await UserImage.find({}, '_id type createdAt')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ message: 'Error fetching images' });
    }
});

router.get('/download/:id', async (req, res) => {
    try {
        const image = await UserImage.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const matches = image.imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid image data' });
        }

        const contentType = matches[1];
        const imageBuffer = Buffer.from(matches[2], 'base64');

        let extension = 'jpg';
        if (contentType.includes('png')) {
            extension = 'png';
        } else if (contentType.includes('gif')) {
            extension = 'gif';
        }

        res.set({
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename=image-${req.params.id}.${extension}`,
            'Content-Length': imageBuffer.length
        });

        res.send(imageBuffer);
    } catch (error) {
        console.error('Error downloading image:', error);
        res.status(500).json({ message: 'Error downloading image' });
    }
});

router.get('/view/:id', async (req, res) => {
    try {
        const image = await UserImage.findById(req.params.id);
        
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const matches = image.imageData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ message: 'Invalid image data' });
        }

        const contentType = matches[1];
        const imageBuffer = Buffer.from(matches[2], 'base64');

        res.set({
            'Content-Type': contentType,
            'Content-Length': imageBuffer.length
        });

        res.send(imageBuffer);
    } catch (error) {
        console.error('Error viewing image:', error);
        res.status(500).json({ message: 'Error viewing image' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const image = await UserImage.findByIdAndDelete(req.params.id);
        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        const latestImages = await UserImage.find({}, '_id type createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        req.app.get('io').emit('newUserPhoto', latestImages);

        res.json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ message: 'Error deleting image' });
    }
});

module.exports = router;