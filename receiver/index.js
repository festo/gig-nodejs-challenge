'use strict';

const WebSocketServer = require('uws').Server;
const logger = require('../common/logger.js');

const wss = new WebSocketServer({ port: 3000 });

wss.on('listening', () => {
  logger.silly('The server is listening');
});

wss.on('connection', (ws) => {
  logger.silly('New client connected');
});