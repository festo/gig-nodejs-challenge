'use strict';

const assert = require('assert');
const WebSocket = require('uws');
const uuid = require('uuid');

const config = require('../common/config');
const Message = require('../common/Message');
const MessageQueue = require('../common/MessageQueue');

let serverEvents;

describe('Receiver', () => {

  before((done) => {
    serverEvents = require('../receiver/');
    serverEvents.on('listening', done);
  });

  after(() => {
    serverEvents.emit('close');
  });

  it('Allows client to connect', (done) => {
    new WebSocket(config.receiver.url).on('open', done);
  });

  it('Allows multiple clients to connect', (done) => {
    Promise.all([
      new Promise((resolve) => {
        new WebSocket(config.receiver.url).on('open', resolve);
      }),
      new Promise((resolve) => {
        new WebSocket(config.receiver.url).on('open', resolve);
      }),
    ]).then(() => {
      done();
    }).catch(done);
  });

  it('Receives HELLO messages from client', (done) => {
    let client = new WebSocket(config.receiver.url);
    client.on('open', () => {
      let message = new Message({
        clientId: uuid.v4(),
        type: Message.types.HELLO,
      });
      client.send(message.toProto(), done);
    });
  });

  it('Sends back an ACK messages', (done) => {
    let client = new WebSocket(config.receiver.url);
    client.on('open', () => {
      let localMessage = new Message({
        clientId: uuid.v4(),
        type: Message.types.HELLO,
      });

      client.on('message', (message) => {
        message = Message.parse(message);
        if (localMessage.id === message.id) {
          done();
        }
      });

      client.send(localMessage.toProto());
    });
  });

  it('Saves message to the MessageQueue', (done) => {
    new MessageQueue()
      .then((messageQueue) => {
        return messageQueue.subscribe(config.channel);
      })
      .then((messageQueue) => {
        const pMessageQueue = new Promise((resolve) => {
          messageQueue.on('message', (channel, message) => {
            message = Message.parse(Buffer.from(message, 'base64'));
            resolve(message);
          });
        });

        const pClient = new Promise((resolve) => {
          const client = new WebSocket(config.receiver.url);
          client.on('open', () => {
            let localMessage = new Message({
              clientId: uuid.v4(),
              type: Message.types.TEXT,
              message: 'Test message for MessageQueue',
            });

            client.on('message', (message) => {
              message = Message.parse(message);
              if (localMessage.id === message.id) {
                resolve(message);
              }
            });

            client.send(localMessage.toProto());
          });
        });

        Promise.all([
          pClient,
          pMessageQueue,
        ]).then(([sentMessage, receivedMessage]) => {
          if (sentMessage.id === receivedMessage.id) {
            done();
          }
        });
      }).catch(done);

  });
});