const amqp = require('amqplib/callback_api');

const RABBITMQ_HOST = 'localhost';
const EXCHANGE_NAME = 'sorting_exchange';
const ROUTING_KEY = 'sort_key';
const QUEUE_NAME = 'sorted_queue';

function createConnection(callback) {
    amqp.connect(`amqp://${RABBITMQ_HOST}`, (err, connection) => {
        if (err) {
            throw err;
        }
        callback(connection);
    });
}

function sendData(data) {
    createConnection(connection => {
        connection.createChannel((err, channel) => {
            if (err) {
                throw err;
            }

            channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
            channel.assertQueue(QUEUE_NAME, { durable: true });
            channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

            channel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify(data)), {
                persistent: true
            });

            console.log(`Sent data to ${QUEUE_NAME}: ${data}`);
            setTimeout(() => {
                connection.close();
            }, 500);
        });
    });
}

function receiveData(callback) {
    createConnection(connection => {
        connection.createChannel((err, channel) => {
            if (err) {
                throw err;
            }

            channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: true });
            channel.assertQueue(QUEUE_NAME, { durable: true });
            channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);

            channel.consume(QUEUE_NAME, msg => {
                if (msg !== null) {
                    const data = JSON.parse(msg.content.toString());
                    callback(data);
                    channel.ack(msg);
                }
            }, { noAck: false });

            console.log(`Waiting for data in ${QUEUE_NAME}. To exit press CTRL+C`);
        });
    });
}

// Example callback function to process received messages
function processMessage(data) {
    console.log(`Received ${JSON.stringify(data)}`);
}

module.exports = {
    sendData,
    receiveData,
    processMessage
};