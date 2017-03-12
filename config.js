/**
 * @file Cisco Spark Main bot
 * @author guillain <guillain@gmail.com>
 * @license LGPL-3.0
 * @features:
 * @@ servicedesk
 */

var config = {};

config.name = 'ServiceDeskBot';
config.debug = '1';

// Flint
config.address = 'servicedeskbot.tontonserver.com';
//config.address = '0.0.0.0';
config.port = '8083';

// Spark
config.sparkbot = 'ServiceDeskBot@sparkbot.io';
config.webhookUrl = 'http://dev-collab.tontonserver.com:8083/flint';
config.token = 'NGMwZmYwYmMtMjQwMC00MmNiLWI0MGYtNDc5NmI2MGQyNTQxN2RiODk2MjYtNzIx';

// Service desk
config.SD = {};
config.SD.storage = 'KM';
config.SD.csv = '/var/www/ServiceDeskBot/conf/km.csv';
config.SD.searchlimit = '10';
config.SD.msgintro = 'Welcome on the _ServiceDesk bot_ demo\n';
config.SD.msgflash = '**Flash message** Demo version is ready!\n';
config.SD.msgend = 'Thanks to have used the _ServiceDesk bot_\n';
config.SD.msgnotfound = 'Sorry we have not found result. Thanks to \n* rephrase your demand \n* [open an incident](http://incident.com).\n';
config.SD.msghelp = '**Help** [*|loadcsv|testcsv|help]\n';
config.SD.msgtips = '_tips: Use the right keywords_\n';

// export config
module.exports = config;
