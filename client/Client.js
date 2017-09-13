'use strict';

const uuid = require('uuid');
const logger = require('../common/logger');

const Message = require('../common/Message');
const Connection = require('./Connection');

module.exports = class Client {
  constructor(receiverUrl, senderUrl) {
    this._receiver = null;
    this._sender = null;
    this._messages = {};
    this._onMessageListener = () => {
    };

    this.id = uuid.v4();

    return new Promise((resolve, reject) => {
      Promise.all([
        new Connection(receiverUrl, this.id),
        new Connection(senderUrl, this.id),
      ])
        .then(([receiver, sender]) => {
          this._receiver = receiver;
          this._sender = sender;

          // Say hello to receiver
          const receiverHelloMessage = new Message({
            clientId: this.id,
            type: Message.types.HELLO,
          });
          this._receiver.send(receiverHelloMessage.toString());
          this._messages[receiverHelloMessage.id] = receiverHelloMessage;

          // Say hello to sender
          const senderHelloMessage = new Message({
            clientId: this.id,
            type: Message.types.HELLO,
          });
          this._sender.send(senderHelloMessage.toString());
          this._messages[senderHelloMessage.id] = senderHelloMessage;

          // Catch messages from the servers
          this._receiver.onMessageListener = this._messageHandler.bind(this);
          this._sender.onMessageListener = this._messageHandler.bind(this);
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

  setOnMessageListener(fn) {
    this._onMessageListener = fn;
  }

  close() {
    this._sender.close();
    this._receiver.close();
  }

  _messageHandler(message) {
    message = Message.parse(message);

    switch (message.type) {
      case Message.types.TEXT:
        if (message.clientId === this.id) {
          let localMessage = this._messages[message.id];
          if (localMessage) {
            localMessage.setStatus(Message.statuses.DELIVERED);
          }
        } else {
          this._onMessageListener(message);
        }
        break;

      case Message.types.ACK:
        let localMessage = this._messages[message.id];
        if (localMessage) {
          localMessage.setStatus(Message.statuses.PROCESSED);
        }
        break;
    }
  }

};