#!/bin/bash

[ -d "./dist/react-app" ] && exit

mkdir -p ./dist/react-app

( cd dist/react-app ; git clone https://github.com/stargazer39/SLIIT-Notifications-Frontend-js.git ./ )
( cd dist/react-app ; npm install && npm run build )

