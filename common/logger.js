'use strict';

const winston = require('winston');
const config = require('./config.js');

const logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      level: config.log.level || 'silly',
      colorize: true,
    })
  ]
});

module.exports = logger;