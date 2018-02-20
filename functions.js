/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('./config');

var redis = require("redis");
var client = redis.createClient({detect_buffers: true});

var Search = require('redis-search');
var search = Search.createSearch(config.SD.storage);

var fs = require('fs');

exports.AI = function (bot, trigger) {
  var arg = trigger.args['0'];
  if (/ServiceDeskBot/i.test(arg)){  arg = trigger.args['1']; }

  if      (/help/i.test(arg))          { bot.say(config.SD.msghelp); }
  else if (/^loadcsv$/i.test(arg))     { loadcsv(bot, trigger); }
  else if (/^testcsv$/i.test(arg))     { testcsv(bot, trigger); }
  else if (/^servicedesk$/i.test(arg)) { sdcontact(bot, trigger); }
  else                                 { mysearch(bot, trigger); }
};

mysearch = function(bot, trigger) {
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
      tosay = config.SD.msgnotfound;
    }
    else if (j > config.SD.searchlimit) {
      tosay += '\n'+j+' result found but '+config.SD.searchlimit+' displayed\n';
    }

    say  = config.SD.msgintro + '\n';
    say += config.SD.msgflash + '\n';
    say += tosay + '\n';
    say += config.SD.msgtips + '\n';
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
}

sdcontact = function(bot, trigger) {
  // Open a Spark room with SD team
  var tosay  = config.SD.msgintrogrp + '\n';
  tosay += config.SD.msgflash + '\n';
  tosay += config.SD.msgtips + '\n';
  tosay += config.SD.msgtodo + '\n';

  var Spark = require('node-sparky');
  var spark = new Spark({ token: config.token  });

  room = spark.roomAdd(config.SD.roomtitle)
    .then(function(room) {
      memberroom = spark.membershipAdd(room.id, config.SD.email, '0')
        .then(function(room) { bot.say('* Membership added with '+config.SD.email); })
        .catch(function(err) { bot.say('* Error during membership'); console.log(err); });
      memberroom = spark.membershipAdd(room.id, trigger.personEmail, '0')
        .then(function(room) { bot.say('* Membership addded with '+trigger.personEmail); })
        .catch(function(err) { bot.say('* Error during membership'); console.log(err); });
      msgsend = spark.messageSendRoom(room.id, {text: tosay, markdown: tosay})
        .then(function(room) { bot.say('* Message sent '); })
        .catch(function(err) { bot.say('* Error to send message'); console.log(err); });
      bot.say('* Room "'+room.title+'" created');
    })
    .catch(function(err) { bot.say('* Error during room creation'); console.log(err); });
  bot.say(config.SD.roommsg);
}

loadcsv = function(bot, trigger){
  // Parse CSV file and set value in redis
  fs.readFile(config.SD.csv, function(err, data) {
    if(err) throw err;
    var strs = [];
    var array = data.toString().split("\n");
    for(i = 0; i < array.length - 1; i++) {
      lineArr = array[i].split(';');
      strs.push(lineArr[0], lineArr[1]);
      //console.log('>>> i:'+i+', key:'+lineArr[0]+', txt:'+lineArr[1]);
    }
    client.del(config.SD.storage, redis.print);
    client.hmset(config.SD.storage, strs, redis.print);
    bot.say('Nb of row imported:'+i);
  });
}

testcsv = function(bot, trigger) {
  client.get('13121', function (err, km) {
    if (km) { bot.say('* km 13121 found:'+km); }
    else { bot.say('* km 13121 not found'); }
  });

  client.hget(config.SD.storage, '13121', function (err, kms) {
    if (kms) { bot.say('* km '+config.SD.storage+' found:'+kms); }
    else { bot.say('* km '+config.SD.storage+' not found'); }
  });
}


