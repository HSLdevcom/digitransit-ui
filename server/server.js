var express = require('express')
var hoganExpress = require('hogan-express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var path = require('path')
var React = require('react')
var Router = require('react-router')
var FluxibleComponent = require('fluxible/addons/FluxibleComponent');
var serialize = require('serialize-javascript');
require('node-cjsx').transform()

/********** Global **********/
var port = process.env.PORT || 8080 
var app = express()

/********** Routes **********/
var application = require('../app/app')
var appRoot = process.cwd() + "/"

/* Setup functions */
function setUpStaticFolders() {
  var staticFolder = appRoot + "/_static"
  var rootPath = process.env.ROOT_PATH != undefined ? process.env.ROOT_PATH : '/'
  var cssFolder = path.join(staticFolder, 'css')
  app.use(rootPath +"css", express.static(cssFolder))
  var jsFolder = path.join(staticFolder, 'js')
  app.use(rootPath +"js", express.static(jsFolder))
  var iconFolder = path.join(staticFolder, 'icon')
  app.use(rootPath +"icon", express.static(iconFolder))
  var fontFolder = path.join(staticFolder, 'font')
  app.use(rootPath +"font", express.static(fontFolder))
  var imgFolder = path.join(staticFolder, 'img')
  app.use(rootPath +"img", express.static(imgFolder))
}

function setUpViewEngine() {
  app.set('views', appRoot + '/app')
  app.engine('html', hoganExpress)
  app.set('view engine', 'html')
}

function setUpMiddleware() {
  app.use(cookieParser())
  app.use(bodyParser.raw())
}


function setUpRoutes() {
  app.use(function (req, res, next) { // pass in `req.url` and the router will immediately match
    var context = application.createContext()
    Router.run(application.getComponent(), req.url, function (Handler, state) {
      if (state.routes[1].isNotFound) {
        res.status(404)
      }
      var state = 'window.state=' + serialize(application.dehydrate(context)) + ';'
      var content = React.renderToString(
        React.createElement(
          FluxibleComponent,
          { context: context.getComponentContext() },
          React.createFactory(Handler)()
        )
      )
      var rootPath = process.env.ROOT_PATH != undefined ? process.env.ROOT_PATH : '/'
      res.render('app', {
        content: content,
        state: state,
        partials: { svgSprite: 'svg-sprite'},
        livereload: process.env.NODE_ENV === "development" ? '//localhost:9000/' : rootPath,
        style: process.env.NODE_ENV === "development" ? '' : '<link rel="stylesheet" href="' + rootPath + 'css/bundle.css">'
      })
    })
  })
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
