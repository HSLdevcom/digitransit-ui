## Install requirements
- Install Node.js 0.12.*
  (if you are on Debian, the distribution version is likely too old -
  in case of problems try https://deb.nodesource.com)
- sudo npm install -g npm@3
- sudo npm install -g nodemon
- sudo npm install -g node-sass
- sudo npm install -g webpack
- npm install
  (you will get warnings, ignore those for now)

## Start national version dev server (with hot code reloading)

###Mac/Linux

- npm run dev

###Windows

- npm run dev-win-national

## Start HSL version dev server (with hot code reloading)

###Mac/Linux

- CONFIG=hsl npm run dev

###Windows

- npm run dev-win-hsl

## Browse to application
- http://localhost:8080/

## Build release version and start production server
- npm run build
- npm run start
