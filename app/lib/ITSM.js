/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');

var request = require("request");

// Generic function to prepare and return the options to request to ITSM
configure = function(method, url_params, body) {
  return {
      method: method,
      url: config.ITSM.url + url_params,
      qs: { sysparm_display_value: 'true' },
      headers: {
        'Cache-Control': 'no-cache',
        Authorization: config.ITSM.auth,
        'Content-Type': 'application/json'
      },
      body: body,
      json: true
  };
}

to_json = function(text) {
  var json = JSON.stringify(text);
  var jres = JSON.parse(json);
  return jres;
}

// Extract and return ticket info
get_ticket_summary = function(ticket) {
  console.log('ticket - ' + ticket.number);
  tosay  = '\n## ' + ticket.number;
  tosay += '\n  * for - ' + ticket.u_requested_for.display_value;
  tosay += '\n  * creator - ' + ticket.sys_created_by;
  tosay += '\n  * last update - ' + ticket.sys_updated_on;
  tosay += '\n  * product - ' + ticket.u_product.display_value;
  tosay += '\n  * owner group - ' + ticket.u_owner_group.display_value;
  tosay += '\n  * assignment group - ' + ticket.assignment_group.display_value;
  tosay += '\n  * company - ' + ticket.company.display_value;
  tosay += '\n  * domain - ' + ticket.sys_domain.display_value;
  tosay += '\n  * scope - ' + ticket.u_scope.display_value;
  tosay += '\n  * comment - ' + ticket.comments;
  return tosay;
}

// List ITSM ticket
exports.list = function(bot, trigger) {
  //options = configure('GET', '/api/now/table/incident?sysparm_query=active%3Dtrue&sysparm_display_value=true&sysparm_limit=10', '');
  options = configure('GET', '/api/now/table/incident?sysparm_query=caller_id=javascript:gs.getUserID()^active=true&sysparm_avg_fields=duration,priority&displayvalue=true','');

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    else {
      var jres = to_json(response);
      if (jres.body.result.length == 0) { bot.say(config.msg.itsmnoticket); }
      else {
        for (var i = 0; i < jres.body.result.length; i++) {
          bot.say(get_ticket_summary(jres.body.result[i]));
        }
      }
    }
  });
};

// Create ITSM ticket
exports.create = function(bot, trigger, title, comments, callback) {
  if ((title == '') || (comments == '')) {
    bot.say(config.msg.itsmcreatehelp);
  }
  else {
    description  = config.msg.itsmdescription;
    description += '\n    * Enduser: ' + trigger.personEmail;
    description += '\n    * SD: ' + config.SD.email;
    description += '\n    * Bot: ' + config.sparkbot;
    description += '\n    * Comments: ' + comments;
    //description += '\nLast '+config.ITSM.nbroldmsg+' messages:\n' + bot.getMessages(config.ITSM.nbroldmsg);

    options = configure('POST', '/api/now/table/incident', {short_description: title, comments: description});
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      var jres = to_json(response);
      var tosay  = config.msg.itsmcreationok;
      tosay += '\n    * Incident number: ' + jres.body.result.number;
      tosay += '\n    * ID: ' + jres.body.result.sys_id;
      tosay += '\n    * Description: ' + description;
      bot.say(tosay);
      callback(tosay, jres.body.result.sys_id, jres.body.result.number);
    });
  }
};

// Update ITSM ticket
exports.update = function(bot, trigger, id, message) {
  if ((id == '') || (message == '')) {
    bot.say(config.msg.itsmupdatehelp);
  }
  else {
    options = configure('PUT', '/api/now/table/incident/' + id, {comments: message}); 
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    });

    bot.say(config.msg.itsmupdateok);
  }
};

