'use strict';

const logger = require('../common/logger');
const config = require('../common/config');

const Client = require('./Client');
const Message = require('../common/Message');

new Client(config.receiver.url)
  .then((client) => {

    client.send('Hello');

  })
  .catch((err) => {
    logger.error(err);
  });
