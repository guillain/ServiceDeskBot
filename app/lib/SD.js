/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');

var Spark = require('node-sparky');
var spark = new Spark({ token: config.token  });

var flash = require('./flash.js');
var incident = require('./incident.js');

// Help fct
exports.help = function() {
  var help  = '## SeviceDesk \n\n';
  help += '* Add the requestor and the one member of the ServiceDesk team in a chat group \n\n';
  help += '* Create **new ITSM incident** to track the activity with the current content\n\n';
  help += '### Command available\n\n';
  help += '* `servicedesk join`: request the ServiceDesk team to join us for incident resolution\n\n';
  help += '* `servicedesk help`: this page\n\n;'
  return help;
}

// Open a Spark room with SD team
exports.join = function(bot, trigger, id) {
  if (/^help$/i.test(trigger.args['1']))    { bot.say(module.exports.help()); return; }

  var tosay  = config.SD.msg.creationintro + '\n\n';
  tosay += flash.get(bot);

  // Create incident to log current request
  incident.create(bot, trigger, config.incident.msg.title + '-' + id, id, function(itsm_data, itsm_id, itsm_number){
    room_title = config.SD.roomtitle + '_' + itsm_number;
    tosay += '\n' + itsm_data;

    // Create Cisco Spark group chat space
    room = spark.roomAdd(room_title)
      .then(function(room) {
        bot.say(config.SD.msg.creationok + '\n* ' + room_title);

        spark.membershipAdd(room.id, config.SD.email, '0')
          .catch(function(err) { bot.say(config.SD.msg.membererr); console.log(err); });
        spark.membershipAdd(room.id, trigger.personEmail, '0')
          .catch(function(err) { bot.say(config.SD.msg.membererr); console.log(err); });

        spark.messageSend({roomId: room.id, text: tosay, markdown: tosay})
          .catch(function(err) { bot.say(config.SD.msg.senterr); console.log(err); });
      })
      .catch(function(err)     { bot.say(config.SD.msg.creationerr);  console.log(err);
        // Update incident to log current room creation issue
        incident.update(bot, trigger, itsm_id, config.SD.msg.creationerr + ' ' + tosay);
      });
  });
};

