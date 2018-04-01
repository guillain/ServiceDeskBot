/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');
var request = require("request");

// Help fct
exports.help = function(table) {
  var help  = '## ITSM '+fupper(table)+' - SeviceNow \n\n';
  help += fupper(table)+' management by chat bot for ServiceNow as ITSM product\n\n';
  help += '### Command available\n\n';
  help += '* `'+table+' list`: list the '+table+' open\n\n';
  help += '* `'+table+' create [title] [comments]`: create new '+table+'\n\n';
  help += '* `'+table+' update [id] [comments]`: update '+table+'\n\n';
  help += '* `'+table+' help`: this page\n\n;'
  return help;
}

// Internal segmentation of the request
exports.switcher = function(bot, trigger, id, table) {
  if      (/^list$/i.test(trigger.args['1']))    { module.exports.list(bot, trigger, table); }
  else if (/^update$/i.test(trigger.args['1']))  { module.exports.update(bot, trigger, id, trigger.args, table); }
  else if (/^create$/i.test(trigger.args['1']))  { module.exports.create(bot, trigger, trigger.args['2'], trigger.args, table, callback()); }  
  else                                           { bot.say(module.exports.help(table)); }
}

// capitalize the first letter
function fupper(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
// lower letter
function tolower(string){
  return string.toLowerCase();
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

// Extract and return info
get_summary = function(data, table) {
  console.log('' + fupper(table) + ' - ' + data.number);
  tosay  = '\n## ' + data.number;
  tosay += '\n  * for - ' + data.u_requested_for.display_value;
  tosay += '\n  * creator - ' + data.sys_created_by;
  tosay += '\n  * last update - ' + data.sys_updated_on;
  tosay += '\n  * product - ' + data.u_product.display_value;
  tosay += '\n  * owner group - ' + data.u_owner_group.display_value;
  tosay += '\n  * assignment group - ' + data.assignment_group.display_value;
  tosay += '\n  * company - ' + data.company.display_value;
  tosay += '\n  * domain - ' + data.sys_domain.display_value;
  tosay += '\n  * scope - ' + data.u_scope.display_value;
  tosay += '\n  * id - ' + data.sys_id;
  tosay += '\n  * comment - ' + data.comments;
  return tosay;
}

// List ITSM 
exports.list = function(bot, trigger, table) {
  if (table === 'task') {
    options = configure('GET', '/api/now/table/'+table+'?sysparm_query=active%3Dtrue&sysparm_display_value=true&sysparm_limit=10', '');
  } else {
    options = configure('GET', '/api/now/table/'+table+'?sysparm_query=caller_id=javascript:gs.getUserID()^active=true&sysparm_avg_fields=duration,priority&displayvalue=true','');
  }
  request(options, function (error, response, body) {
    if (error) throw new Error(error);
    else {
      var jres = to_json(response);
      if ((!jres.body.result) || ((jres.body.result) && (jres.body.result.length == 0))) { bot.say(config.ITSM.msg.notfound); }
      else {
        for (var i = 0; i < jres.body.result.length; i++) {
          bot.say(get_summary(jres.body.result[i], table));
        }
        bot.say(config.ITSM.msg.nbrtotalfound + ': **' + jres.body.result.length + '**');
      }
    }
  });
};

// Create ITSM
exports.create = function(bot, trigger, title, comments, table, callback) {
  if ((title == '') || (comments == '') || (table == '')) { bot.say(help()); }
  else {
    description  = config.ITSM.msg.description;
    description += '\n  * Enduser: ' + trigger.personEmail;
    description += '\n  * SD: ' + config.SD.email;
    description += '\n  * Bot: ' + config.sparkbot;
    description += '\n  * Comments: ' + comments;
    //description += '\nLast '+config.ITSM.nbroldmsg+' messages:\n' + bot.getMessages(config.ITSM.nbroldmsg);

    options = configure('POST', '/api/now/table/' + table, {short_description: title, comments: description});
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
      var jres = to_json(response);
      var tosay  = config.ITSM.msg.creationok;
      tosay += '\n  * '+fupper(table)+' number: ' + jres.body.result.number;
      tosay += '\n  * ID: ' + jres.body.result.sys_id;
      tosay += '\n  * Description: ' + description;
      bot.say(tosay);
      callback(tosay, jres.body.result.sys_id, jres.body.result.number);
    });
  }
};

// Update ITSM 
exports.update = function(bot, trigger, id, message, table) {
  if ((id == '') || (message == '') || (table == '')) { bot.say(help()); }
  else {
    options = configure('PUT', '/api/now/table/' + table + '/' + id, {comments: message}); 
    request(options, function (error, response, body) {
      if (error) throw new Error(error);
    });
    bot.say(config.ITSM.msg.updateok);
  }
};

// Auto Update done by chat event
exports.auto_update = function(bot, trigger, table) {
  name = tolower(config.sparkbot);
  from = tolower(trigger.personEmail);
  if(from != name) {
    var tosay = config.ITSM.msg.updateok + '\n';
    tosay += '* Room titile: ' + trigger.roomTitle + '\n';
    tosay += '* From: ' + trigger.personEmail + '\n';
    tosay += '* Message: ' + trigger.text + '\n';

    // Check if mapping roomId vs itsmId exist
    data = bot.recall(trigger.roomId);
    if(data){
      if(data.itsm_id) {
        console.log('>>> ITSM auto_update. id: ' + data.itsm_id + ', table: '+table + ', tosay: ' + tosay);
        module.exports.update(bot, trigger, data.itsm_id, tosay, table);
      }
    }
  }
}

