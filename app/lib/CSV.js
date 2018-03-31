/**
 * @file Defines CSV functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');
var redis = require("redis");
var client = redis.createClient({detect_buffers: true});
var Search = require('redis-search');
var search = Search.createSearch(config.db.km);
var fs = require('fs');

// Help fct
exports.help = function() {
  var help  = '## CSV\n\n';
  help += 'Manage CSV file as source of knoweldge\n\n';
  help += '### Command available\n\n';
  help += '* `csv load`: load local CSV file as source in the local database\n\n';
  help += '* `csv test`: check alignment between local CSV and local database\n\n';
  help += '* `csv help`: this command\n\n';
  return help;
}

// Internal segmentation of the request
exports.switcher = function(bot, trigger, id) {
  if      (/^load$/i.test(trigger.args['1']))    { module.exports.load(bot, trigger); }
  else if (/^test$/i.test(trigger.args['1']))    { module.exports.test(bot, trigger); }
  else                                           { bot.say(module.exports.help()); }
}

// Load CSV file content in Redis
exports.load = function(bot, trigger){
  // Parse CSV file and set value in redis
  fs.readFile(config.CSV.file, function(err, data) {
    if(err) throw err;
    var strs = [];
    var array = data.toString().split("\n");
    for(i = 0; i < array.length - 1; i++) {
      lineArr = array[i].split(';');
      strs.push(lineArr[0], lineArr[1]);
      //console.log('>>> i:'+i+', key:'+lineArr[0]+', txt:'+lineArr[1]);
    }
    client.del(config.db.km, redis.print);
    client.hmset(config.db.km, strs, redis.print);
    bot.say('Nb of row imported:'+i);
  });
}

// Test Redis content coming from CSV file
exports.test = function(bot, trigger) {
  client.get('13121', function (err, km) {
    if (km) { bot.say('* km 13121 found:'+km); }
    else { bot.say('* km 13121 not found'); }
  });

  client.hget(config.db.km, '13121', function (err, kms) {
    if (kms) { bot.say('* km '+config.db.km+' found:'+kms); }
    else { bot.say('* km '+config.db.km+' not found'); }
  });
}

