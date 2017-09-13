'use strict';

const WebSocketServer = require('uws').Server;
const logger = require('../common/logger.js');
const CHANNEL = 'challenge';

const Message = require('../common/Message');
const MessageQueue = require('../common/MessageQueue');

const wss = new WebSocketServer({ port: 3000 });

let pServer = new Promise((resolve) => {
  wss.on('listening', () => {
    logger.info('The server is listening');
    resolve();
  });
});

let pMQ = new Promise((resolve, reject) => {
  new MessageQueue().then(resolve).catch(reject);
});

Promise.all([pServer, pMQ]).then((values) => {
  const mq = values[1];

  wss.on('connection', (ws) => {
    logger.silly('New client connected');
    let clientId = null;

    ws.on('message', (message) => {
      let oMessage = Message.parse(message);

      if(oMessage.type === Message.types.HELLO) {
        clientId = oMessage.clientId;
        logger.silly('Client identify themselves as %s', clientId);
      }

      // Distribute TEXT messages only
      if(oMessage.type === Message.types.TEXT) {
        mq.publish(CHANNEL, oMessage.toString());
      }

      const ackMessage = new Message({
        id: oMessage.id,
        type: Message.types.ACK,
      });
      ws.send(ackMessage.toString());

      logger.silly(message);
    });
  });
});

