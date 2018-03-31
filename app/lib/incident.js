/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');
var request = require("request");

// Help fct
exports.help = function() {
  var help  = '## ITSM Incident - SeviceNow \n\n';
  help += 'Incident management by chat bot for ServiceNow as ITSM product\n\n';
  help += '### Command available\n\n';
  help += '* `incident list`: list the incidents open\n\n';
  help += '* `incident create [title] [comments]`: create new incident\n\n';
  help += '* `incident update [id] [comments]`: update an incident\n\n';
  help += '* `incident help`: this page\n\n;'
  return help;
}

// Internal segmentation of the request
exports.switcher = function(bot, trigger, id) {
  if      (/^list$/i.test(trigger.args['1']))    { module.exports.list(bot, trigger); }
  else if (/^update$/i.test(trigger.args['1']))  { module.exports.update(bot, trigger, id, trigger.args); }
  else if (/^create$/i.test(trigger.args['1']))  { module.exports.create(bot, trigger, trigger.args['2'], trigger.args, callback()); }  
  else                                           { bot.say(module.exports.help()); }
}

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

// Extract and return incident info
get_incident_summary = function(incident) {
  console.log('incident - ' + incident.number);
  tosay  = '\n## ' + incident.number;
  tosay += '\n  * for - ' + incident.u_requested_for.display_value;
  tosay += '\n  * creator - ' + incident.sys_created_by;
  tosay += '\n  * last update - ' + incident.sys_updated_on;
  tosay += '\n  * product - ' + incident.u_product.display_value;
  tosay += '\n  * owner group - ' + incident.u_owner_group.display_value;
  tosay += '\n  * assignment group - ' + incident.assignment_group.display_value;
  tosay += '\n  * company - ' + incident.company.display_value;
  tosay += '\n  * domain - ' + incident.sys_domain.display_value;
  tosay += '\n  * scope - ' + incident.u_scope.display_value;
  tosay += '\n  * comment - ' + incident.comments;
  return tosay;
}

// List ITSM incident
exports.list = function(bot, trigger) {
  //options = configure('GET', '/api/now/table/incident?sysparm_query=active%3Dtrue&sysparm_display_value=true&sysparm_limit=10', '');
  options = configure('GET', '/api/now/table/incident?sysparm_query=caller_id=javascript:gs.getUserID()^active=true&sysparm_avg_fields=duration,priority&displayvalue=true','');

  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    else {
      var jres = to_json(response);
      if ((jres.body.result) && (jres.body.result.length == 0)) { bot.say(config.incident.msg.notfound); }
      else {
        for (var i = 0; i < jres.body.result.length; i++) {
          bot.say(get_incident_summary(jres.body.result[i]));
        }
      }
    }
  });
};

// Create ITSM incident
exports.create = function(bot, trigger, title, comments, callback) {
  if ((title == '') || (comments == '')) { bot.say(help()); }
  else {
    description  = config.incident.msg.description;
    description += '\n  * Enduser: ' + trigger.personEmail;
    description += '\n  * SD: ' + config.SD.email;
    description += '\n  * Bot: ' + config.sparkbot;
    description += '\n  * Comments: ' + comments;
    //description += '\nLast '+config.ITSM.nbroldmsg+' messages:\n' + bot.getMessages(config.ITSM.nbroldmsg);

    options = configure('POST', '/api/now/table/incident', {short_description: title, comments: description});
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      var jres = to_json(response);
      var tosay  = config.incident.msg.creationok;
      tosay += '\n  * Incident number: ' + jres.body.result.number;
      tosay += '\n  * ID: ' + jres.body.result.sys_id;
      tosay += '\n  * Description: ' + description;
      bot.say(tosay);
      callback(tosay, jres.body.result.sys_id, jres.body.result.number);
    });
  }
};

// Update ITSM incident
exports.update = function(bot, trigger, id, message) {
  if ((id == '') || (message == '')) { bot.say(help()); }
  else {
    options = configure('PUT', '/api/now/table/incident/' + id, {comments: message}); 
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    });

    bot.say(config.incident.msg.updateok);
  }
};

