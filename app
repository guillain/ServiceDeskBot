#!/bin/bash

APP='servicedeskbot.js'
APP_DIR='/var/www/servicedeskbot'
LOG_DIR="${APP_DIR}/log"

# For the manual mode and the tunneling
# ngrok http 80
# lt -s mytest -p 80

cd "${APP_DIR}"

case $1 in
  start)
    pm2 start "${APP}" \
    --log    "${LOG_DIR}/all.log" \
    --output "${LOG_DIR}/app.log" \
    --error  "${LOG_DIR}/err.log" \
    --merge-logs \
    --log-date-format="YYYY-MM-DD HH:mm Z"
  ;;
  stop)
    pm2 stop "${APP}";;
  restart)
    $0 stop
    $0 start
    ;;
  show)
    pm2 show "${APP}";;
  status)
    pm2 status "${APP}";;
  log)
    pm2 log "${APP}";;
  manual)
    DEBUG=* node "${APP}";;
  *) echo "command not found";;
esac

