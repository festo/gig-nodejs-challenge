'use strict';

const WebSocketServer = require('uws').Server;
const logger = require('../common/logger.js');
const config = require('../common/config');

const Message = require('../common/Message');
const MessageQueue = require('../common/MessageQueue');

// Create WebSocket server
let pServer = new Promise((resolve) => {
  const wss = new WebSocketServer({
    port: config.sender.port
  }).on('listening', () => {
    logger.info('The server is listening');
    resolve(wss);
  });
});

// Connect to the Message Queue
let pMQ = new Promise((resolve, reject) => {
  new MessageQueue().then(resolve).catch(reject);
});

Promise.all([pServer, pMQ]).then(([server, messageQueue]) => {
  messageQueue.subscribe(config.channel);

  server.on('connection', (ws) => {
    logger.silly('New client connected');
    ws.clientId = null;

    ws.on('message', (message) => {
      let oMessage = Message.parse(message);

      if(oMessage.type === Message.types.HELLO) {
        ws.clientId = oMessage.clientId;
        logger.silly('Client identify themselves as %s', ws.clientId);
      }

      // The message is processed, send back an ACK
      const ackMessage = new Message({
        id: oMessage.id,
        type: Message.types.ACK,
      });
      ws.send(ackMessage.toString());
    });
  });

  // receive message from the queue and send it to teh connected clients
  messageQueue.on('message', (channel, message) => {
    logger.silly('Received a message from %s channel', channel);
    server.broadcast(message);
  });
});

