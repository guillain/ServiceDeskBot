/**
 * @file Defines ServiceDesk functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');

var Spark = require('node-sparky');
var spark = new Spark({ token: config.token  });

var ITSM = require('./ITSM.js');

// Open a Spark room with SD team
exports.join = function(bot, trigger, id) {
  var tosay  = config.msg.roomcreationintro + '\n\n';
  tosay += config.msg.flash + '\n\n';

  // Create ITSM ticket to log current request
  ITSM.create(bot, trigger, config.msg.itsmtitle + '-' + id, id, function(itsm_data, itsm_id, itsm_number){
    room_title = config.SD.roomtitle + ' ' + itsm_number;
    tosay += '\n' + itsm_data;

    // Create Cisco Spark group chat space
    room = spark.roomAdd(room_title)
      .then(function(room) {
        bot.say(config.msg.roomcreationok + ': ' + room_title);

        spark.membershipAdd(room.id, config.SD.email, '0')
          .then(function(room) { bot.say(config.msg.memberadded+' - '+config.SD.email); })
          .catch(function(err) { bot.say(config.msg.membererr); console.log(err); });
        spark.membershipAdd(room.id, trigger.personEmail, '0')
          .then(function(room) { bot.say(config.msg.memberadded+' - '+trigger.personEmail); })
          .catch(function(err) { bot.say(config.msg.membererr); console.log(err); });

        spark.messageSend({roomId: room.id, text: tosay, markdown: tosay})
          .then(function(room) { bot.say(config.msg.sent); })
          .catch(function(err) { bot.say(config.msg.senterr); console.log(err); });
      })
      .catch(function(err)     { bot.say(config.msg.roomcreationerr);  console.log(err);
        // Update ITSM ticket to log current room creation issue
        ITSM.update(bot, trigger, itsm_id, config.msg.roomcreationissue);
      });
  });
};

