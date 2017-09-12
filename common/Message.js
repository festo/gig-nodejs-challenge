'use strict';

const uuid = require('uuid');

module.exports = class Message {
  constructor(options) {
    this.id = uuid.v4();
    this.type = options.type;
    this.clientId = options.clientId;
    this.message = options.message;
    this.createdAt = Date.now();
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

  static get types() {
    return {
      HELLO: 'HELLO',
      TEXT: 'TEXT',
    };
  }
};