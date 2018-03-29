/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');

var request = require("request");

// Create ITSM ticket
exports.create = function(bot, trigger, title, comments) {
  if ((title == '') || (comments == '')) {
    bot.say(config.msg.itsmcreatehelp);
  }
  else {
    description  = config.msg.istmdescription;
    description += '\n    * Enduser: '+trigger.personEmail;
    description += '\n    * SD: '+config.SD.email;
    description += '\n    * Bot: '+config.sparkbot;
    description += '\n\n    Comments: '+comments;
    //description += '\nLast '+config.ITSM.nbroldmsg+' messages:\n' + bot.getMessages(config.ITSM.nbroldmsg);

    var options = { 
      method: 'POST',
      url: config.ITSM.url + '/api/now/table/incident',
      qs: { sysparm_display_value: 'true' },
      headers: {
        'Cache-Control': 'no-cache',
        Authorization: config.ITSM.auth,
        'Content-Type': 'application/json'
      },
      body: {
        short_description: title,
        comments: description
      },
      json: true
    };

    request(options, function (error, response, body) {
      if (error) throw new Error(error);

      bot.say(config.msg.itsmcreationok+'\n    * Incident number: \n    * Description: '+description);

      return body;
    });
  }
};

// Update ITSM ticket
exports.update = function(bot, trigger, id, message) {
  if ((id == '') || (message == '')) {
    bot.say(config.msg.itsmupdatehelp);
  }
  else {
    var options = {
      method: 'PUT',
      url: config.ITSM.url + '/api/now/table/incident/' + id,
      qs: { sysparm_display_value: 'true' },
      headers: {
        'Cache-Control': 'no-cache',
        Authorization: config.ITSM.auth,
        'Content-Type': 'application/json'
      },
      body: {
        comments: message
      },
      json: true
    }; 
  
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    });

    bot.say(config.msg.itsmupdateok);
  }
};

