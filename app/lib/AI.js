/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');
var flash = require('./flash.js');

var request = require("request");

var redis = require("redis");
var client = redis.createClient({detect_buffers: true});

var Search = require('redis-search');
var search = Search.createSearch(config.db.km);

var fs = require('fs');

// Help fct
exports.help = function() {
  var help  = '## AI \n\n';
  help += 'Search engine based on NoSQL and BigData database\n\n';
  return help;
}

// Search master fct
exports.search = function(bot, trigger, id) {
  var tosay = config.AI.msg.found + '\n';
  console.log('>>> AI.search: trigger.args.join(): ' + trigger.args.join(' '));

  client.hgetall(config.db.km, function(err,kms){
    j = 0;
    if (err) throw err;
    for (var i in kms) { 
      var re =  new RegExp('\\b'+ trigger.args.join(' ') + '\\b','i');
      if(re.exec(kms[i])) { 
        if (j < config.AI.searchlimit) { tosay += '- '+kms[i]+'\n'; }
        j++;
      }
    }
    if (j == 0) {
      tosay = config.msg.notfound;
    }
    else if (j > config.AI.searchlimit) {
      tosay += '\n'+j+' result found but '+config.AI.searchlimit+' displayed\n';
    }

    say  = config.msg.intro + '\n\n';
    say += config.flash.msg.intro + ' ' + flash.get(bot) + '\n\n';
    say += tosay + '\n\n';
    say += config.msg.tips + '\n\n';
    bot.say(say);
  });
  /*
  search.query(phrase, function(err, ids){
    if (err) throw err;
    console.log('Search results for "%s":', phrase);
    console.log(ids);
    if (ids.length != 0) {
      tosay = 'Found \n';
      for(var i in ids) { tosay += '- '+ids[i]+'\n'; }
      bot.say(tosay);
    } else { bot.say(config.msg.notfound); }
  });
  */
};

