const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const photoRoutes = require('./routes/photos');
const userImageRoutes = require('./routes/userImages');
const { CLIENT_URL } = require('./server_config');


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: [CLIENT_URL, "null", "file://"],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: ['Content-Type']
    }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: [CLIENT_URL, "null", "file://"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ['Content-Type']
}));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    console.log(`${req.method} ${req.path}`);
    next();
});


mongoose.connect('mongodb://localhost:27017/photoGallery', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});


io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('newUserPhoto', async (latestImages) => {

        io.emit('newUserPhoto', latestImages);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


app.set('io', io);


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use('/api/photos', photoRoutes);
app.use('/api/userImages', userImageRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
