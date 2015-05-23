var express = require('express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var fs = require('fs')
var path = require('path')
var React = require('react')
var Router = require('react-router')
var FluxibleComponent = require('fluxible/addons/FluxibleComponent');
var serialize = require('serialize-javascript');
var Promise = require('es6-promise').Promise;
require('node-cjsx').transform()

/********** Global **********/
var port = process.env.PORT || 8080 
var rootPath = process.env.ROOT_PATH != undefined ? process.env.ROOT_PATH : '/'
var app = express()

/********** Application **********/
var application = require('../app/app')
var appRoot = process.cwd() + "/"
var applicationHtml = require('../app/html')
var svgSprite = fs.readFileSync(appRoot + 'static/svg-sprite.svg')
if (process.env.NODE_ENV !== "development") {
  var css = fs.readFileSync(appRoot + '_static/css/bundle.css')
}

/* Setup functions */
function setUpStaticFolders() {
  var staticFolder = appRoot + "/_static"
  var cssFolder = path.join(staticFolder, 'css')
  app.use(rootPath +"css", express.static(cssFolder))
  var jsFolder = path.join(staticFolder, 'js')
  app.use(rootPath +"js", express.static(jsFolder))
  var iconFolder = path.join(staticFolder, 'icon')
  app.use(rootPath +"icon", express.static(iconFolder))
  var imgFolder = path.join(staticFolder, 'img')
  app.use(rootPath +"img", express.static(imgFolder))
}

function setUpMiddleware() {
  app.use(cookieParser())
  app.use(bodyParser.raw())
}

function setUpRoutes() {
  app.use(function (req, res, next) { // pass in `req.url` and the router will immediately match
    var context = application.createContext()
    Router.run(application.getComponent(), req.url, function (Handler, state) {
      render = function() {
        var content = React.renderToString(
          React.createElement(
            FluxibleComponent,
            { context: context.getComponentContext() },
            React.createFactory(Handler)()
          )
        )

        var html = React.renderToString(
          React.createElement(
            applicationHtml,
            {
              css: process.env.NODE_ENV === "development" ? false : css,
              svgSprite: svgSprite,
              content: content,
              phantomjsPrototypePolyfill: process.env.NODE_ENV === "development" ? fs.readFileSync('app/util/phantomjs-prototype-polyfill.js') : "",
              state: 'window.state=' + serialize(application.dehydrate(context)) + ';',
              livereload: process.env.NODE_ENV === "development" ? '//localhost:9000/' : rootPath
            }
          )
        )

        res.send('<!doctype html>' + html);
      }
      if (state.routes[1].isNotFound) {
        res.status(404)
      }
      if (state.routes[state.routes.length -1].handler.loadAction) {
        context.getActionContext().executeAction(state.routes[state.routes.length-1].handler.loadAction, {params:state.params, query:state.query}).then(render)
      } else {
        render()
      }
    })
  })
}

function startServer() {
  var server = app.listen(port, function() {
    console.log('Reittiopas UI available on port %d', server.address().port)
  })  
}

/********** Init **********/
setUpStaticFolders()
setUpMiddleware()
setUpRoutes()
startServer()
module.exports.app = app
