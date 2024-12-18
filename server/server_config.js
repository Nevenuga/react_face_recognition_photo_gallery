const CONFIG = {
    SERVER_IP: '176.108.250.60',
    SERVER_PORT: '5000',
    CLIENT_PORT: '3000'
};

const CLIENT_URL = `http://${CONFIG.SERVER_IP}:${CONFIG.CLIENT_PORT}`;
const SERVER_URL = `http://${CONFIG.SERVER_IP}:${CONFIG.SERVER_PORT}`;
const MONGODB_URL = `mongodb://127.0.0.1:27017/photoGallery`;

module.exports = {
    CONFIG,
    CLIENT_URL,
    SERVER_URL,
    MONGODB_URL
};