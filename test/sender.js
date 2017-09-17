'use strict';

const assert = require('assert');
const WebSocket = require('uws');
const uuid = require('uuid');

const config = require('../common/config');
const Message = require('../common/Message');
const MessageQueue = require('../common/MessageQueue');

describe('Receiver', () => {

  before((done) => {
    const serverEvents = require('../sender/');
    serverEvents.on('listening', done);
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
    done(new Error());
  });

  it('Distribute messages from message queue to multiple clients', (done) => {
    done(new Error());
  });
});