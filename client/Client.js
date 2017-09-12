'use strict';

const WebSocket = require('uws');
const uuid = require('uuid');
const logger = require('../common/logger');

module.exports = class Client {
  constructor(url) {
    this.isConnected = false;
    this.id = uuid.v4();
    this.onMessageListener = function() {};

    this.ws = new WebSocket(url);

    this.ws.on('open', () => {
      this.isConnected = true;
      logger.silly('Client %s connected to the server', this.id);
    });

    this.ws.on('close', () => {
      this.isConnected = false;
      logger.silly('Client %s disconnected from teh server', this.id);
    });

    this.ws.on('message', (data) => {
      this.onMessageListener(data);
    });
  }

  send(message) {
    if (!this.isConnected) {
      return;
    }

    this.ws.send(message, (err) => {
      if (!!err) {
        logger.error(err);
      }

      return;
    });

  }

  setOnMesageListener(fn) {
    this.onMessageListener = fn;
  }

  close() {
    this.ws.close();
    this.isConnected = false;
    logger.silly('Client %s closed the connection');
  }

};