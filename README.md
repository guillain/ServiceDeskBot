# ServiceDeskBot
Cisco Spark Bot for ServiceDesk
## HowTo
* clone localy: 
 git clone servicedeskbot
* install dependencies:
> npm install
* Create the log folder:
> mkdir log
* Config your app:
> vi config.js
* run the application, two configuration available:
1/ for the dev, node is used:
> ./app manual
2/ for the prod, pm2 is used (install also this dependency):
> ./app [start|stop|restart|show|staus|log]
* Add the bot in 1:1 chat room
Have fun
