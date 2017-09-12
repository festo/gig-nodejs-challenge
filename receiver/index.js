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
    let oMessage = Message.parse(message);

    if(oMessage.type === Message.types.HELLO) {
      clientId = oMessage.clientId;
      logger.silly('Client identify themselves as %s', clientId);
    }

    // TODO: save message to the message que

    const ackMessage = new Message({
      id: oMessage.id,
      type: Message.types.ACK,
    });
    ws.send(ackMessage.toString());

    logger.silly(message);
  });
});