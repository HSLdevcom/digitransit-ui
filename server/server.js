var express = require('express')
var hoganExpress = require('hogan-express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var path = require('path')

/********** Global **********/
var port = process.env.PORT || 8080 
var app = express()

/********** Routes **********/
var index = require('./route/index')
var appRoot = process.cwd() + "/"

/* Setup functions */
function setUpStaticFolders() {  
  var staticFolder = appRoot + "/_static"
  var cssFolder = path.join(staticFolder, 'css')
  app.use("/css", express.static(cssFolder))
  var jsFolder = path.join(staticFolder, 'js')
  app.use("/js", express.static(jsFolder))
  var iconFolder = path.join(staticFolder, 'icon')
  app.use("/icon", express.static(iconFolder))
  var fontFolder = path.join(staticFolder, 'font')
  app.use("/font", express.static(fontFolder))
}

function setUpViewEngine() {
  app.set('views', appRoot + '/js')
  app.set('layout', 'app');
  app.engine('html', hoganExpress)
  app.set('view engine', 'html')
}

function setUpMiddleware() {
  app.use(cookieParser())
  app.use(bodyParser.raw())
}


function setUpRoutes() {
  app.use('/', index.index)
}

function startServer() {
  var server = app.listen(port, function() {
    console.log('Reittiopas UI available on port %d', server.address().port)
  })  
}

/********** Init **********/
setUpViewEngine()
setUpStaticFolders()
setUpMiddleware()
setUpRoutes()
startServer()
module.exports.app = app
