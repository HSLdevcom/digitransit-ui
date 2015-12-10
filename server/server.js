/********** Polyfills (for node) **********/
require('node-cjsx').transform();
require("babel-register")({presets: ['es2015', 'react'], plugins: ['transform-class-properties', './build/babelRelayPlugin']});

global.fetch = require('node-fetch');
global.self = {fetch: global.fetch};


var config = require('../app/config');
if (process.env.NODE_ENV == 'production') {
  var raven = require('raven');
}

/********** Server **********/
var express = require('express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')

/********** Global **********/
var port = config.PORT || 8080
var app = express()

/* Setup functions */
function setUpStaticFolders() {
  var staticFolder = process.cwd() + "/_static"
  // Sert cache for 1 week
  app.use(config.APP_PATH, express.static(staticFolder, {maxAge: 604800000}))
}

function setUpMiddleware() {
  app.use(cookieParser())
  app.use(bodyParser.raw())
}

function onError(err, req, res, next) {
  res.statusCode = 500;
  res.end(err.message + err.stack);
}

function setupRaven() {
  if (process.env.NODE_ENV == 'production') {
    app.use(raven.middleware.express.requestHandler(process.env.SENTRY_SECRET_DSN));
  }
}

function setupErrorHandling(){
  if(process.env.NODE_ENV == 'production') {
    app.use(raven.middleware.express.errorHandler(process.env.SENTRY_SECRET_DSN));
  }

  app.use(onError);
}

function setUpRoutes() {
  app.use(require('../app/server'));
}

function startServer() {
  var server = app.listen(port, function() {
    console.log('Digitransit-ui available on port %d', server.address().port)
  })
}

/********** Init **********/
setupRaven()
setUpStaticFolders()
setUpMiddleware()
setUpRoutes()
setupErrorHandling()
startServer()
module.exports.app = app
