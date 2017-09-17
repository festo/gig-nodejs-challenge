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
    serverEvents = require('../sender/');
    serverEvents.on('listening', done);
  });

  after(() => {
    serverEvents.emit('close');
  });

  it('Allows client to connect', (done) => {
    new WebSocket(config.sender.url).on('open', done);
  });

  it('Allows multiple clients to connect', (done) => {
    Promise.all([
      new Promise((resolve) => {
        new WebSocket(config.sender.url).on('open', resolve);
      }),
      new Promise((resolve) => {
        new WebSocket(config.sender.url).on('open', resolve);
      }),
    ]).then(() => {
      done();
    }).catch(done);
  });

  it('Receives HELLO messages from client', (done) => {
    let client = new WebSocket(config.sender.url);
    client.on('open', () => {
      let message = new Message({
        clientId: uuid.v4(),
        type: Message.types.HELLO,
      });
      client.send(message.toProto(), done);
    });
  });

  it('Sends back an ACK messages', (done) => {
    let client = new WebSocket(config.sender.url);
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

  it('Distribute messages from message queue', (done) => {

    const pClient = new Promise((resolve) => {
      const client = new WebSocket(config.sender.url).on('open', () => {
        resolve(client);
      });
    });

    const pMessageQueue = new Promise((resolve, reject) => {
      new MessageQueue().then(resolve).catch(reject);
    });

    Promise
      .all([pClient, pMessageQueue])
      .then(([client, messageQueue]) => {
        let localMessage = new Message({
          clientId: uuid.v4(),
          type: Message.types.TEXT,
          message: 'Test message for MessageQueue',
        });

        client.on('message', (message) => {
          message = Message.parse(message);
          if (localMessage.id === message.id) {
            done();
          }
        });

        // To generate the bugger
        localMessage.toProto();
        messageQueue.publish(config.channel, localMessage.toString());
      })
      .catch(done);

  });

  it('Distribute messages from message queue to multiple clients', (done) => {
    const pClient1 = new Promise((resolve) => {
      const client = new WebSocket(config.sender.url).on('open', () => {
        resolve(client);
      });
    });

    const pClient2 = new Promise((resolve) => {
      const client = new WebSocket(config.sender.url).on('open', () => {
        resolve(client);
      });
    });

    const pMessageQueue = new Promise((resolve, reject) => {
      new MessageQueue().then(resolve).catch(reject);
    });

    Promise
      .all([pClient1, pClient2, pMessageQueue])
      .then(([client1, client2, messageQueue]) => {
        let localMessage = new Message({
          clientId: uuid.v4(),
          type: Message.types.TEXT,
          message: 'Test message for MessageQueue',
        });

        const pClient1Message = new Promise((resolve) => {
          client1.on('message', (message) => {
            message = Message.parse(message);
            resolve(message);
          });
        });

        const pClient2Message = new Promise((resolve) => {
          client2.on('message', (message) => {
            message = Message.parse(message);
            resolve(message);
          });
        });

        Promise
          .all([
            pClient1Message,
            pClient2Message,
          ])
          .then(([message1, message2]) => {
            if (message1.id === localMessage.id && message2.id === localMessage.id) {
              done();
            }
          });

        // To generate the bugger
        localMessage.toProto();
        messageQueue.publish(config.channel, localMessage.toString());
      })
      .catch(done);
  });
});