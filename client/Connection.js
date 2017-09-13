'use strict';

const WebSocket = require('uws');

const logger = require('../common/logger');
const Message = require('../common/Message');

module.exports = class Connection {
  constructor(url, clientId) {
    this.onMessageListener = function() {};
    this.isConnected = false;
    this.clientId = clientId;
    this.ws = new WebSocket(url);

    return new Promise((resolve, reject) => {
      this.ws.on('open', () => {
        this.isConnected = true;
        logger.silly('Client %s connected to the server %s', this.clientId, url);
        resolve(this);
      });

      this.ws.on('close', () => {
        reject();
        this.isConnected = false;
        logger.silly('Client %s disconnected from the server %s', this.clientId, url);
      });

      this.ws.on('message', (data) => {
        this.onMessageListener(data);
      });
    });
  }

  send(message) {
    this.ws.send(message);
  }

  close() {
    this.ws.close();
    this.isConnected = false;
    logger.silly('Client %s closed the connection', this.clientId);
  }
};
