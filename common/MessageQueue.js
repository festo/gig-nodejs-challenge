'use strict';

const redis = require('redis');
const config = require('../common/config');
const logger = require('../common/logger');

/**
 * The aim of this file to create a common interface for the message queue. The current implementation uses Redis PubSub
 * but I hope it can be easily replace to 0QM or RabbitMQ
 */

module.exports = class MessageQueue {
  constructor() {
    return new Promise((resolve) => {
      this.pub = redis.createClient(config.messageQueue.url);
      this.sub = redis.createClient(config.messageQueue.url);

      resolve(this);
    });
  }

  publish(channel, data) {
    logger.silly('Publish data to %s', channel);
    this.pub.publish(channel, data);
  }

  subscribe(channel) {
    logger.silly('Subscribe for %s channel', channel);
    this.sub.subscribe(channel);
  }

  on(eventType, fn) {
    logger.silly('Registar an error handler for %s event', eventType);
    this.sub.on(eventType, (channel, message) => {
      logger.silly('%s event received');
      fn(channel, message);
    });
  }

};