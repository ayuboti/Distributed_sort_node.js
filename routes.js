const express = require('express');
const { sendData, receiveData, processMessage } = require('./rabbitmq');

const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

router.post('/sort', (req, res) => {
    const data = req.body.numbers;
    try {
        const numbers = data.split(',').map(Number);
        const sortedNumbers = numbers.sort((a, b) => b - a);
        sendData(sortedNumbers);
        res.json(sortedNumbers);
    } catch (error) {
        res.status(400).json({ error: 'Invalid input. Please enter a list of numbers separated by commas.' });
    }
});

router.post('/generate', (req, res) => {
    const totalNumbers = parseInt(req.body.total_numbers);
    if (isNaN(totalNumbers) || totalNumbers <= 0) {
        return res.status(400).json({ error: 'Invalid input. Please enter a valid integer.' });
    }

    const numbers = Array.from({ length: totalNumbers }, () => Math.floor(Math.random() * 1000) + 1);
    const sortedNumbers = numbers.sort((a, b) => b - a);
    sendData(sortedNumbers);
    res.json(sortedNumbers);
});

router.post('/receive', (req, res) => {
    receiveData(processMessage);
    res.json({ message: 'Receiving data...' });
});

module.exports = router;