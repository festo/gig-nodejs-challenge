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
    done(new Error());
  });

  it('Allows multiple clients to connect', (done) => {
    done(new Error());
  });

  it('Receives HELLO messages from client', (done) => {
    done(new Error());
  });

  it('Distribute messages from message queue', (done) => {
    done(new Error());
  });

  it('Distribute messages from message queue to multiple clients', (done) => {
    done(new Error());
  });
});