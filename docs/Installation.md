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
- Ensure you have npm3 installed: 'sudo npm install -g npm@3'
- Clear npm cache: 'npm cache clean'
- remove node_modules: 'rm -rf node_modules'
- Try again: 'npm install'

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

## Changing url for OpenTripPlanner and Geocoding
In package.json there is a configuration variable "SERVER_ROOT". It controls where user interface connects in order to do e.g. routing.
By default it uses http://matka.hsl.fi but you can override SERVER_ROOT like so:

- npm run dev --digitransit-ui:SERVER_ROOT=http://dev.digitransit.fi

## Build release version and start production server
- npm run build --digitransit-ui:SERVER_ROOT={This depends on environment}
- npm run start
