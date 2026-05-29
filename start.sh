#!/bin/sh
node /server/index.js &
nginx -g "daemon off;"
