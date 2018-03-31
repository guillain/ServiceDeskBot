# ServiceDeskBot
Cisco Spark Bot for ServiceDesk

## What is it?
* Q&A chatbot integrated on redis db
* DB can be loaded with csv file
* User can be put in a new room with ServiceDesk (keyword: servicedesk)
* Based on [node-flint](https://github.com/flint-bot/flint) (nodejs)
* Logstash cnnector to send all messages
* ITSM (servicenow) integration to create and update ticket
* <img src="doc/chatbot.png" height="300px">

## Scenario
![](doc/workflow.png)

## Advanced Scenario
![](doc/workflow_adv.png)

## HowTo
* Clone localy
```bash
git clone https://github.com/guillain/ServiceDeskBot.git
```
* Go into the folder
```bash
cd ServiceDeskBot
```

### PM2 environment

* Install dependencies
```bash
npm install
```
* Put your CSV file (named km.csv) in the conf folder (key->txt structure)
```
cp [your CSV file] conf/km.csv
```
* Config your app with your [spark bot](https://developer.ciscospark.com/apps.html)
```
vi config.js
```
* Run the application, two configuration availables
* 1/ For the dev, node is used
```bash
./run manual
```
* 2/ For the prod, pm2 is used (install also this dependency)
```
./run [start|stop|restart|show|status|log]
```
* Add the bot in 1:1 chat room
* Load the csv file (from the room)
```bash
loadcsv
```
* Ask the bot

### Docker environment
Provided also for Docker env. with the Dockerfile for the standalone builder

To build the image:
`docker build -t bot/servicedesk .`

To run the image:
`docker run -d -p 8080:8080 bot/servicedesk`

To go in the container:
`docker exec -it bot/servcedesk /bin/bash`

## BigData with Logstash connector embeded
Settings is done to send all chat messages formatted properly to a log stash system.

Thanks to active it in the configuration file
```bash
config.js
> config.bigdata.enable = true;
```

## Current issue
* flint Redis storage (issue: https://github.com/flint-bot/flint/issues/22). Thanks to use the old redis.js file.

# CREDITS

## Cisco Spark
* http://developer.ciscospark.com/
* https://github.com/flint-bot/flint
* https://github.com/flint-bot/sparky

## Google
* https://cloud.google.com/translate
* https://github.com/statickidz/node-google-translate-skidz

## Redis
* https://github.com/NodeRedis/node_redis

## Done
[done.md](doc/done.md)

## ToDo
[todo.md](doc/todo.md)

Have fun
