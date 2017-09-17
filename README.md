# gig-nodejs-challenge

[![Build Status](https://travis-ci.org/festo/gig-nodejs-challenge.svg?branch=master)](https://travis-ci.org/festo/gig-nodejs-challenge)

This is my implementation for the GiG challenge, it contains   
- a demo client and a Client model,
- a receiver server that receives the messages from the client,
- a sender server that broadcasts the messages to the connected clients,
- a message queue adapter that currently uses a redis pub/sub
- tests with Mocha

### Installation guideline

* Set up a redis server
* Edit the configuration file if needed 
   `common/config.js`
* Install dependencies
  `npm i`

### How to start
* Start the receiver
  `node receiver`
* Start the sender
 `node sender`
  