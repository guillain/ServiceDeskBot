/**
 * @file Logstash - log sender 
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */

var Logstash = require('logstash-client');

// Load config
var config = require('../config');

exports.send = function(bot, trigger) {
  // If BigData feature activated
  if (config.bigdata.enable == true) {
    var message = {
      'timestamp': new Date(),
      'message': trigger.text,
      'from': trigger.personEmail,
      'spaceid': trigger.roomId,
      'spacename': trigger.roomTitle,
      'level': 'info',
      'type': 'bot'
    };

    var logstash = new Logstash({
      type:config.bigdata.type,
      host: config.bigdata.host, 
      port: config.bigdata.port
    });
    logstash.send(message);
  }
};

