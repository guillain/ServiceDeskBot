/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');

var request = require("request");

var redis = require("redis");
var client = redis.createClient({detect_buffers: true});

var Search = require('redis-search');
var search = Search.createSearch(config.SD.storage);

var fs = require('fs');

exports.search = function(bot, trigger) {
  var phrase = '';
  var tosay = '_Search result_ \n';
  for (i = 0; i < trigger.args.length; i++) {
    if(i == 0) { phrase  = trigger.args[i]; }
    else       { phrase += ' '+trigger.args[i]; }
  }

  client.hgetall(config.SD.storage, function(err,kms){
    j = 0;
    if (err) throw err;
    for (var i in kms) { 
      //console.log('>>> i:'+i+', kms[i]:'+kms[i]);
      var re =  new RegExp('\\b'+ phrase + '\\b','i');
      if(re.exec(kms[i])) { 
        //console.log('Found :'+kms[i]);
        if (j < config.SD.searchlimit) { tosay += '- '+kms[i]+'\n'; }
        j++;
      }
    }
    if (j == 0) {
      tosay = config.msg.notfound;
    }
    else if (j > config.SD.searchlimit) {
      tosay += '\n'+j+' result found but '+config.SD.searchlimit+' displayed\n';
    }

    say  = config.msg.intro + '\n\n';
    say += config.msg.flash + '\n\n';
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
    } else { bot.say('Not found'); }
  });
  */
};

