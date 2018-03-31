/**
 * @file Google Translator features
 * @author guillain guillain@gmail.com
 * @license GPL-3.0
 */

// Load config
var config = require('../config');
var translate = require('node-google-translate-skidz');

// Help fct
exports.help = function(bot, trigger) {
  var help  = '## Translate \n\n';
  help += 'Text translation online via chat bot \n\n';
  help += '### How to use the translation \n\n';
  help += '#### Manualy \n\n`[lang in] [lang out] [*/phrase]` \n\n';
  help += '* en fr I like it! \n\n';
  help += '* fr de j\'ai un rendez-vous demain \n\n';
  help += '#### Automaticaly \n\n`[*/phrase]` (the languages must be configured and activated before)\n\n';
  help += '* I like it! \n\n';
  help += '### Commands to configure auto translation\n\n';
  help += '* `translate on`: active the auto translation \n\n';
  help += '* `translate off`: deactive the auto translation \n\n';
  help += '* `translate config [lang in] [lang out]`: configure the auto translation \n\n';
  help += '* `translate state`: provide the current state \n\n';
  help += '### lang \n\n*107*, in summary \n\n';
  help += '* en - English \n\n';
  help += '* es - Spanish\n\n';
  help += '* fr - French \n\n';
  help += '* de - German \n\n';
  help += '* ru - Russian \n\n';
  help += '* it - Italian \n\n';
  help += '* ja - Japanese \n\n';
  help += '* ar - Arabic \n\n';
  help += '* zh-CN - Chinese (Simplified) \n\n';
  help += '* zh-TW - Chinese (Traditional) \n\n';
  help += 'Full list: https://cloud.google.com/translate/docs/languages\n\n';
  bot.say(help);
};

// Main
exports.switcher = function(bot, trigger, id) {
  // Get back data from local database
  var data = bot.recall(config.userDB);
  //console.log(JSON.stringify(data, null, 4));
  if(!data)          { data = bot.store(config.userDB, {}); }
  if(!data.state)    { data.state = false; }
  if(!data.langin)   { data.langin = 'fr'; }
  if(!data.langout)  { data.langout = 'en'; }

  // Internal segmentation of the request
  if      (/^on$/i.test(trigger.args['1']))      { data.state = true; bot.say('Auto translation **ON**'); }
  else if (/^off$/i.test(trigger.args['1']))     { data.state = false; bot.say('Auto translation **OFF**'); }
  else if (/^state$/i.test(trigger.args['1']))   { bot.say('State: ' + data.state); }
  else if (/^config$/i.test(trigger.args['1']))  { 
    if      (trigger.args.length == 2)             { bot.say('Configuration\n* In: ' + data.langin + '\n* Out: ' + data.langout); }
    else if (trigger.args.length == 4) {
      // todo: check if 1 & 2 exist and in the dict
      data.langin = trigger.args['2'];
      data.langout = trigger.args['3'];
      bot.say('Configuration saved _(' + data.langin + ',' + data.langout + ')_');
    }
  }
  else {
    // Auto or Manual?
    if (!data.state){
      if(trigger.args.length > 2){
        // todo: check if 0 & 1 exist and in the dict
        data.langin = trigger.args['1'];
        data.langout = trigger.args['2'];
        trigger.args.splice(0,3);
      }
      else { module.exports.help(bot, trigger); return; }
    }
    console.log('>>> IN >>> lang: '+data.langin+', phrase: '+ trigger.args.join(' '));
    translate({
      text: trigger.args.join(' '),
      source: data.langin,
      target: data.langout
    }, function(result) {
      console.log('>>> OUT >>> lang: '+data.langout+', result: '+ result);
      bot.say('_('+data.langin+' to '+data.langout+')_ ' + result);
    });
  }
};
