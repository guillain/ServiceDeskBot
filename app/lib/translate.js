/**
 * @file Cisco Spark Main bot to procee myTranslator
 * @author guillain guillain@gmail.com
 * @license GPL-3.0
 */

// Import module
var translate = require('node-google-translate-skidz');

// Load config
var config = require('../config');

// Help fct
// https://cloud.google.com/translate/docs/languages
help = function() {
  var help  = '**Translate** \n\n';
  help += '_Description_ : Text translation online via chat bot \n\n';
  help += '_Commands_ : [lang in] [lang out] [*/phrase] \n\n';
  help += '* fr I like it! \n\n';
  help += '* fr de j\'ai un rendez-vous demain \n\n';
  help += '_lang_: *107*, in summary \n\n';
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
  return(help);
}

exports.translate = function(bot, trigger) {
  var phrase = '';

  if (trigger.args['0'] === config.name) { trigger.args.splice(0,1); }  

  if      (trigger.args.length == 1) {
    if      (trigger.args['0'] == 'help') { bot.say('' + help()); }
    else if (trigger.args['0'] == 'test') { bot.say('test ok'); }
    else                                  { bot.say( 'Error in the syntax \n\n' + help()); }
  }
  else if (trigger.args.length < 3)       { bot.say( 'Error in the syntax \n\n' + help()); }
  else {
    var langIn = trigger.args['0'];
    var langOut = trigger.args['1'];
    for (i = 2; i < trigger.args.length; i++) { phrase += ' '+trigger.args[i]; }
    console.log('langIn:' + langIn + ', phraseIn:' + phrase);

    translate({
      text: phrase,
      source: langIn,
      target: langOut
    }, function(result) {
      console.log('langOut:' + langOut + ', phraseOut:' + result);
      bot.say('' + result);
    });
  }
});

