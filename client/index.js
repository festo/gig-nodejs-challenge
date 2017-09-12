'use strict';

const WebSocket = require('uws');

const logger = require('../common/logger');
const config = require('../common/config');

const ws = new WebSocket(config.receiver.url);

ws.on('open', () => {
  logger.silly('Connected to server');
});

ws.on('close', () => {
  logger.silly('Disconnected from the server');
});

ws.on('message', (data) => {
  logger.silly(data);
});
