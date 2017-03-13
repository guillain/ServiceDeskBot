# ServiceDeskBot
Cisco Spark Bot for ServiceDesk

## What is it?
* Q&A bot integrated on redis db
* DB can be loaded with csv file
* User can be put in a new room with ServiceDesk (keyword: servicedesk)
* Based on [node-flint](https://github.com/flint-bot/flint) (nodejs)

## HowTo
* clone localy: 

> git clone https://github.com/guillain/ServiceDeskBot.git

* install dependencies:

> npm install

* Put your CSV file (named km.csv) in the conf folder (key->txt structure)

> cp [your CSV file] conf/km.csv

* Config your app with your [spark bot](https://developer.ciscospark.com/apps.html):

> vi config.js

* run the application, two configuration available:

1. for the dev, node is used:

> ./app manual

2. for the prod, pm2 is used (install also this dependency):

> ./app [start|stop|restart|show|staus|log]

* Add the bot in 1:1 chat room
* Load the csv file (from the room):

> loadcsv

* Ask the bot



Have fun
