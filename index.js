/**
 * @file Cisco Spark Main bot
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 * @features:
 * @@ servicedesk
 */

// Import module
var Flint = require('node-flint');
var webhook = require('node-flint/webhook');
var RedisStore = require('node-flint/storage/redis'); // load driver
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');
var app = express();
app.use(bodyParser.json());

// Load config
var config = require('./config');

// Init flint
var flint = new Flint(config);

// My additionnal features
var myServiceDesk = require('./servicedesk.js');

// Use redis storage
flint.storageDriver(new RedisStore('redis://127.0.0.1')); // select driver

// Start flint
flint.start();

// Set default messages to use markdown globally for this flint instance...
flint.messageFormat = 'markdown';

// Debug echo
flint.on('initialized', function() {
  flint.debug('initialized %s rooms', flint.bots.length);
});

//
flint.on('message', function(bot, trigger, id) {
});

flint.on('message', function(bot, trigger, id) {
  //flint.debug('"%s":"%s":"%s"', trigger.roomTitle,trigger.personEmail,trigger.text);
});

// Define express path for incoming webhooks
app.post('/flint', webhook(flint) );

// Default: ServiceDesk module
flint.hears(/.*/, function(bot, trigger) {
  myServiceDesk.AI(bot, trigger);
});

// Start expess server
var server = app.listen(config.port, function () {
  flint.debug('Flint listening on port %s', config.port);
});

// Gracefully shutdown (ctrl-c)
process.on('SIGINT', function() {
  flint.debug('stoppping...');
  server.close();
  flint.stop().then(function() {
    process.exit();
  });
});

