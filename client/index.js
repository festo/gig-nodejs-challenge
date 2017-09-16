'use strict';

const logger = require('../common/logger');
const config = require('../common/config');

const Client = require('./Client');
const Message = require('../common/Message');

Promise.all([
  new Client(config.receiver.url, config.sender.url),
  new Client(config.receiver.url, config.sender.url),
])
  .then(([client1, client2]) => {
    client1.send('Hello');

    client2.setOnMessageListener((message) => {
      logger.verbose('Message received: %s from %s ', message.message, message.clientId);
    });
  })
  .catch((err) => {
    logger.error(err);
  });