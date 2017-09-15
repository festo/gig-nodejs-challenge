'use strict';

const uuid = require('uuid');
const protobuf = require('protobufjs');

const messageProto = './common/Message.proto';
const protoRoot = protobuf.loadSync(messageProto);
const MessageProto = protoRoot.lookupType('challenge.gig.Message');

module.exports = class Message {
  constructor(options) {
    this.id = options.id || uuid.v4();
    this.type = options.type;
    this.clientId = options.clientId;
    this.message = options.message;
    this.createdAt = new Date();
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

  toProto() {
    const protoObject = {
      id: this.id,
      type: this.type,
      clientId: this.clientId,
      message: this.message,
      createdAt: this.createdAt.toISOString(),
    };

    // Verify the message
    const protoError = MessageProto.verify(protoObject);
    if (protoError) {
      throw Error(protoError);
    }

    const proto = MessageProto.create(protoObject);
    const buffer = MessageProto.encode(proto).finish();

    return buffer;
  }

  setStatus(status) {
    this.status = status;
  }

  static parse(message) {
    message = Buffer.from(message);
    const proto = MessageProto.decode(message);
    const protoObject = MessageProto.toObject(proto, {
      enums: String,
    });

    // Create a new Message instance
    return new this(protoObject);
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