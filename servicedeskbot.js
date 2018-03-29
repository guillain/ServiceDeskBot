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
var ITSM = require('./lib/ITSM.js');
var logstash = require('./lib/logstash.js');

// Use redis storage
flint.storageDriver(new RedisStore('redis://127.0.0.1')); // select driver

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
  var arg = trigger.args['0'];
  if (/ServiceDeskBot/i.test(arg))       { arg = trigger.args['1']; }

  if      (/^help$/i.test(arg))          { bot.say(config.msg.help); }
  else if (/^loadcsv$/i.test(arg))       { CSV.load(bot, trigger); }
  else if (/^testcsv$/i.test(arg))       { CSV.test(bot, trigger); }
  else if (/^createticket/i.test(arg))   { ITSM.create(bot, trigger, trigger.args['1'], trigger.args); }
  else if (/^updateticket/i.test(arg))   { ITSM.update(bot, trigger, id, trigger.args); }
  else if (/^joinsd$/i.test(arg))        { SD.join(bot, trigger, id); }
  else                                   { AI.search(bot, trigger, id); }
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

