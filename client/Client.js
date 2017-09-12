'use strict';

const WebSocket = require('uws');
const uuid = require('uuid');
const logger = require('../common/logger');

const Message = require('../common/Message');

module.exports = class Client {
  constructor(url) {
    this.isConnected = false;
    this.id = uuid.v4();
    this.onMessageListener = function() {};
    this.ws = new WebSocket(url);

    return new Promise((resolve, reject) => {
      this.ws.on('open', () => {
        this.isConnected = true;
        logger.silly('Client %s connected to the server', this.id);

        // Send a HELLO message to teh server
        const message = new Message({
          clientId: this.id,
          type: Message.types.HELLO,
        });
        this._send(message);

        resolve(this);
      });

      this.ws.on('close', () => {
        reject();
        this.isConnected = false;
        logger.silly('Client %s disconnected from teh server', this.id);
      });

      this.ws.on('message', (data) => {
        logger.silly('Client %s received a message from the receiver: %s', this.id, data);
        this.onMessageListener(data);
      });
    });
  }

  _send(message) {
    if (!this.isConnected) {
      logger.warn('Error! Client $s not connected to teh server', this.id);
      return;
    }

    this.ws.send(message.toString(), (err) => {
      if (!!err) {
        logger.error(err);
      }

      logger.silly('Message %s sent to the receiver', message.id);
    });
  }

  send(text) {
    const message = new Message({
      clientId: this.id,
      type: Message.types.TEXT,
      message: text,
    });

   this._send(message);
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