'use strict';

module.exports = {
  log: {
    level: 'silly',
  },
  receiver: {
    url: 'ws://localhost:3000',
    port: 3000,
  },
  sender: {
    url: 'ws://localhost:3001',
    port: 3001,
  },
  messageQueue: {
    url: 'redis://localhost:6379'
  },
  channel: 'challenge',
};