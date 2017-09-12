'use strict';

const logger = require('../common/logger');
const config = require('../common/config');
const Client = require('./Client');

const client = new Client(config.receiver.url);