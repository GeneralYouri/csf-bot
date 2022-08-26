if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const BotClient = require('./Structures/BotClient');
const config = require('../config');

const client = new BotClient(config);
client.start();
