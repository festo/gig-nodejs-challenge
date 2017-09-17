'use strict';

module.exports = {
  log: {
    level: process.env.LOG_LEVEL || 'silly',
  },
  receiver: {
    url: process.env.RECEIVER_URL || 'ws://localhost:3000',
    port: 3000,
  },
  sender: {
    url: process.env.SENDER_URL || 'ws://localhost:3001',
    port: 3001,
  },
  messageQueue: {
    url: process.env.MESSAGE_QUEUE_URL || 'redis://localhost:6379',
  },
  channel: 'challenge',
};