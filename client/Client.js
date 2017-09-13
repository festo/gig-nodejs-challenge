'use strict';

const uuid = require('uuid');
const logger = require('../common/logger');

const Message = require('../common/Message');
const Connection = require('./Connection');

module.exports = class Client {
  constructor(receiverUrl, senderUrl) {
    this._receiver = null;
    this._sender = null;
    this.id = uuid.v4();

    return new Promise((resolve, reject) => {
      Promise.all([
        new Connection(receiverUrl, this.id),
        new Connection(senderUrl, this.id),
      ])
        .then((values) => {
          this._receiver = values[0];
          this._sender = values[1];

          // Let's introduce the client to teh servers
          const message = new Message({
            clientId: this.id,
            type: Message.types.HELLO,
          });
          this._send(message);

          resolve(this);
        })
        .catch(reject);
    });
  }

  _send(message) {
    if (!this._receiver.isConnected) {
      logger.warn('Error! Client %s not connected to the server', this.id);
      return;
    }

    this._receiver.send(message.toString(), (err) => {
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
    this._sender.onMessageListener = fn;
  }

  close() {
    this._sender.close();
    this._receiver.close();
  }

};