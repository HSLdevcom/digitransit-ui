## Install requirements
- Install Node.js
  (if you are on Debian, the distribution version is likely too old -
  in case of problems try https://deb.nodesource.com)
- sudo npm install -g npm@3
- sudo npm install -g nodemon
- sudo npm install -g node-sass
- sudo npm install -g webpack
- npm install
  (you will get warnings, ignore those for now)

## :warning: What if 'npm install' fails?
- Ensure you have npm3 installed: 'sudo npm install -f npm@3'
- Clear npm cache: 'npm cache clean'
- remove node_modules: 'rm -rf node_modules'
- Try again: 'npm install'

## Start national version dev server (with hot code reloading)
- npm run dev

## Start HSL version dev server (with hot code reloading)
- CONFIG=hsl npm run dev

## Browse to application 
- http://localhost:8080/

## Build release version and start production server
- npm run build
- npm run start
