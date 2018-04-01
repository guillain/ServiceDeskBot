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
var ITSM = require('./ITSM.js');

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

// Captialize the first letter
function fupper(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Open a Spark room with SD team
exports.join = function(bot, trigger, id) {
  if (/^help$/i.test(trigger.args['1']))    { bot.say(module.exports.help()); return; }

  var tosay  = config.SD.msg.creationintro + '\n\n';
  tosay += flash.get(bot) + '\n\n';

  // Create incident to log current request
  ITSM.create(bot, trigger, config.ITSM.msg.title + '-' + id, trigger.roomId, 'incident',function(itsm_data, itsm_id, itsm_number){
    room_title = 'Incident - ' + itsm_number;
    tosay += '\n' + itsm_data;

    // Create Cisco Spark group chat space
    room = spark.roomAdd(room_title)
      .then(function(room) {
        bot.say(config.SD.msg.creationok + '\n* ' + room_title);

        // Permanent storage of the IDs (room and itsm)
        data = bot.store(room.id,{});
        data.title = room_title;
        data.creator = trigger.personEmail;
        data.itsm_id = itsm_id;
        data.itsm_number = itsm_number;

        data_inv = bot.store(itsm_id,{});
        data_inv.roomId = room.id;

        // Add participant: Owner of the request and SD people
        spark.membershipAdd(room.id, config.SD.email, '0')
          .catch(function(err) { bot.say(config.SD.msg.membererr); console.log(err); });
        spark.membershipAdd(room.id, trigger.personEmail, '0')
          .catch(function(err) { bot.say(config.SD.msg.membererr); console.log(err); });

        // Send summary message
        spark.messageSend({roomId: room.id, text: tosay, markdown: tosay})
          .catch(function(err) { bot.say(config.SD.msg.senterr); console.log(err); });
      })
      .catch(function(err)     { bot.say(config.SD.msg.creationerr);  console.log(err);
        // Update incident to log current room creation issue
        ITSM.update(bot, trigger, itsm_id, config.SD.msg.creationerr + ' ' + tosay, 'incident');
      });
  });
};

