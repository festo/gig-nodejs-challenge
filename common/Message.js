'use strict';

const uuid = require('uuid');
const logger = require('../common/logger');

module.exports = class Message {
  constructor(options) {
    this.id = options.id || uuid.v4();
    this.type = options.type;
    this.clientId = options.clientId;
    this.message = options.message;
    this.createdAt = Date.now();
    this.status = 'CREATED';
  }

  toString()  {
    return JSON.stringify({
      id: this.id,
      type: this.type,
      clientId: this.clientId,
      message: this.message,
      createdAt: this.createdAt,
    });
  }

  setStatus(status) {
    this.status = status;
  }

  static parse(message) {
    let oMessage = {};
    try {
      oMessage = new this(JSON.parse(message));
    } catch(e) {
      logger.error(e);
    }
    return oMessage;
  }

  static get types() {
    return {
      HELLO: 'HELLO',
      TEXT: 'TEXT',
      ACK: 'ACK',
    };
  }

  static get statuses() {
    return {
      CREATED: 'CREATED',
      PROCESSED: 'PROCESSED',
      DELIVERED: 'DELIVERED',
    };
  }
};