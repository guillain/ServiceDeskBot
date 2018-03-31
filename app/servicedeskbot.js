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
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());
var RedisStore = require('node-flint/storage/redis'); // load driver

// Load config
var config = require('./config');

// Init flint
var flint = new Flint(config);

// The key features
var AI   = require('./lib/AI.js');
var SD   = require('./lib/SD.js');
var CSV  = require('./lib/CSV.js');
var flash = require('./lib/flash.js');
var incident = require('./lib/incident.js');
var translate = require('./lib/translate.js');
var logstash = require('./lib/logstash.js');

// Use redis storage
flint.storageDriver(new RedisStore('redis://'+config.db.host+'')); // select driver

// Start flint
flint.start();

// Debug echo
flint.on('initialized', function() {
  flint.debug('initialized %s rooms', flint.bots.length);
});

// BigData & debug
flint.on('message', function(bot, trigger, id) {
  flint.debug('"%s":"%s":"%s"', trigger.roomTitle,trigger.personEmail,trigger.text);
  logstash.send(bot, trigger); // send all messages to logstash (if enable and conf)
});

// Listen on all path
flint.hears(/.*/, function(bot, trigger, id) {
  // Remove bot name if in the first arg. position
  if (trigger.args['0'] === config.name)           { trigger.args.splice(0,1); }

  // Check if command is requested
  if      (/^help$/i.test(trigger.args['0']))      { bot.say(config.msg.help); }
  else if (/^csv/i.test(trigger.args['0']))        { CSV.switcher(bot, trigger, id); }
  else if (/^flash/i.test(trigger.args['0']))      { flash.switcher(bot, trigger, id); }
  else if (/^joinsd/i.test(trigger.args['0']))     { SD.join(bot, trigger, id); }
  else if (/^incident/i.test(trigger.args['0']))   { incident.switcher(bot, trigger, id); }
  else if (/^translate/i.test(trigger.args['0']))  { translate.switcher(bot, trigger, id); }
  // If not request the search engine to find the arg. in the knowledge source(s)
  else                                             { AI.search(bot, trigger, id); }
});

// Define express path for incoming webhooks
app.post('/flint', webhook(flint) );

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

