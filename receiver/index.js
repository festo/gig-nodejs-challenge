'use strict';

const WebSocketServer = require('uws').Server;
const logger = require('../common/logger.js');

const Message = require('../common/Message');

const wss = new WebSocketServer({ port: 3000 });

wss.on('listening', () => {
  logger.info('The server is listening');
});

wss.on('connection', (ws) => {
  logger.silly('New client connected');
  let clientId = null;

  ws.on('message', (message) => {
    let oMessage;
    try {
      oMessage = JSON.parse(message);
    } catch(e) {
      logger.error(e);
    }

    if(oMessage.type === Message.types.HELLO) {
      clientId = oMessage.clientId;
      logger.silly('Client identify themselves as %s', clientId);
    }

    logger.silly(message);
  });
});