const { PythonShell } = require('python-shell');
const path = require('path');

const processImage = async (base64Image) => {
    return new Promise((resolve, reject) => {
        const options = {
            mode: 'text',
            pythonPath: 'python3',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, '../python'),
            args: []
        };

        const pyshell = new PythonShell('image_processor.py', options);

        let result = '';

        pyshell.send(base64Image);

        pyshell.on('message', function (message) {
            result = message;
        });

        pyshell.end(function (err) {
            if (err) {
                console.error('Error processing image:', err);
                reject(err);
            }
            
            try {
                const parsedResult = JSON.parse(result);
                resolve(parsedResult);
            } catch (parseErr) {
                console.error('Error parsing result:', parseErr);
                reject(parseErr);
            }
        });
    });
};

module.exports = { processImage };
