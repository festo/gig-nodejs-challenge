# gig-nodejs-challenge

[![Build Status](https://travis-ci.org/festo/gig-nodejs-challenge.svg?branch=master)](https://travis-ci.org/festo/gig-nodejs-challenge)

This is my implementation for the GiG challenge, it contains   
- a demo client and a Client model,
- a receiver server that receives the messages from the client,
- a sender server that broadcasts the messages to the connected clients,
- a message queue adapter that currently uses a redis pub/sub
- tests with Mocha,
- a docker compose file for easy setup.

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
 
### Docker
The docker compose file is ready to use, you can set up the services with two commands:

```
docker-compose bild
docker-compose up
```
  
### Requirements
The project is tested and implemented with
- Node v6.9.1
- NPM 4.5.0
- Docker Compose 1.14.0
- Redis 3.2.1  