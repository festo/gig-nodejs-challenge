'use strict';

const WebSocketServer = require('uws').Server;
const logger = require('../common/logger.js');
const config = require('../common/config');

const Message = require('../common/Message');
const MessageQueue = require('../common/MessageQueue');

// Create WebSocket server
let pServer = new Promise((resolve) => {
  const wss = new WebSocketServer({
    port: config.receiver.port
  }).on('listening', () => {
    logger.info('The server is listening');
    resolve(wss);
  });
});

// Connect to the Message Queue
let pMQ = new Promise((resolve, reject) => {
  new MessageQueue()
    .then(resolve)
    .catch(reject);
});

Promise.all([pServer, pMQ]).then(([server, messageQueue]) => {
  server.on('connection', (ws) => {
    logger.silly('New client connected');
    ws.clientId = null;

    ws.on('message', (message) => {
      try {
        message = Message.parse(message);
      } catch (error) {
        logger.error(error);
        return;
      }

      if (message.type === Message.types.HELLO) {
        ws.clientId = message.clientId;
        logger.silly('Client identify themselves as %s', ws.clientId);
      }

      // Distribute TEXT messages only
      if (message.type === Message.types.TEXT) {
        messageQueue.publish(config.channel, message.toString());
      }

      // The message is processed, send back an ACK
      const ackMessage = new Message({
        id: message.id,
        type: Message.types.ACK,
      });
      ws.send(ackMessage.toProto());
    });
  });
});

