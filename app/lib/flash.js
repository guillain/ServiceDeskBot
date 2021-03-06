/**
 * @file Defines CSV functions for Spark
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 */
// Load config
var config = require('../config');

// Help fct
exports.help = function() {
  var help  = '## Flash message\n\n';
  help += 'Manage Flash message\n\n';
  help += '### Command available\n\n';
  help += '* `flash`: display current flash message\n\n';
  help += '* `flash update [\*/phrase]`: update the flash message and store it permanently in the local database\n\n';
  help += '* `flash help`: this message\n\n';
  return help;
}

// Internal segmentation of the request
exports.switcher = function(bot, trigger, id) {
  // Get back the fash message from the local db if exist
  var flash = bot.recall(config.flash.db);
  if(!flash)      { flash = bot.store(config.flash.db,{}); } 
  if(!flash.text) { flash.text = config.flash.msg.default; }

  if      (/^help$/i.test(trigger.args['1']))    { bot.say(module.exports.help()); }
  else if (/^update$/i.test(trigger.args['1']))  { 
    trigger.args.splice(0,2);
    flash.text = trigger.args.join(' ');
    bot.say(config.flash.msg.updateok+' _('+flash.text+')_');
  }
  else                                           { bot.say(config.flash.msg.intro +' '+flash.text); }
}

// Get, set or default
exports.get = function(bot) {
  var flash = bot.recall(config.flash.db);
  if(!flash)     { flash = bot.store(config.flash.db,{}); }
  if(!flash.text) { flash.text = config.flash.msg.default; }

  return flash.text;
}
