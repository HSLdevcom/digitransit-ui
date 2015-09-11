// Polyfill for node
// XXX Test on new node 4.0 release
global.Intl = require('intl');

var express = require('express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var fs = require('fs')
var path = require('path')
var React = require('react')
var ReactDOM = require('react-dom/server')
var Router = require('react-router/lib/Router')
var FluxibleComponent = require('fluxible-addons-react/FluxibleComponent');
var IntlProvider = require('react-intl').IntlProvider;
var Location = require('react-router/lib/Location');
var serialize = require('serialize-javascript');
var polyfillService = require('polyfill-service');
require('node-cjsx').transform();
require("babel/register")({stage: 0});

/********** Polyfill **********/
global.fetch = require('node-fetch');
global.self = {fetch: global.fetch};

/********** Global **********/
var port = process.env.PORT || 8080
var rootPath = process.env.ROOT_PATH != undefined ? process.env.ROOT_PATH : '/'
var app = express()

/********** Application **********/
var application = require('../app/app')
var translations = require('../app/translations')
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
  app.use(rootPath + "css", express.static(cssFolder))
  var jsFolder = path.join(staticFolder, 'js')
  app.use(rootPath + "js", express.static(jsFolder))
  var mapFontsFolder = path.join(staticFolder, 'map', 'fonts')
  app.use(rootPath + "mapFonts", express.static(mapFontsFolder, {
    setHeaders: function(res) {res.setHeader("Content-Encoding","gzip")}
  }))
  var mapFolder = path.join(staticFolder, 'map')
  app.use(rootPath + "map", express.static(mapFolder))
  var iconFolder = path.join(staticFolder, 'icon')
  app.use(rootPath + "icon", express.static(iconFolder))
  var imgFolder = path.join(staticFolder, 'img')
  app.use(rootPath + "img", express.static(imgFolder))
}

function setUpMiddleware() {
  app.use(cookieParser())
  app.use(bodyParser.raw())
}

function setUpRoutes() {
  app.use(function (req, res, next) { // pass in `req.url` and the router will immediately match
    var locale = req.query.locale || req.acceptsLanguages(['fi', 'sv', 'en']) || 'en';
    var messages = translations[locale]
    var context = application.createContext()
    var location = new Location(req.path, req.query);
    Router.run(application.getComponent(), location, function (error, initialState, transition) {
      render = function() {
        var content = "";
        if (!initialState.components[initialState.components.length - 1].getQuery) {// Ugly way to see if this is a Relay RootComponent
          content = ReactDOM.renderToString(
            React.createElement(
              FluxibleComponent,
              { context: context.getComponentContext() },
              React.createElement(
                IntlProvider, {locale: locale},
                React.createElement(
                  Router,
                  { location: initialState.location,
                    branch: initialState.branch,
                    components: initialState.components,
                    params: initialState.params }
                )
              )
            )
          );
        };
        var polyfillContent = polyfillService.getPolyfillString({
          uaString: req.headers['user-agent'],
          features: {
            'Function.prototype.bind': {flags: ['gated']},
            'matchMedia': {flags: ['gated']},
            'fetch': {flags: ['always', 'gated']}, // 'always' for ie_mob
            'Promise': {flags: ['gated']},
            'String.prototype.repeat': {flags: ['always', 'gated']}
          },
          minify: true,
          unknown: 'polyfill'
        });

        var html = ReactDOM.renderToStaticMarkup(
          React.createElement(
            applicationHtml,
            {
              css: process.env.NODE_ENV === "development" ? false : css,
              svgSprite: svgSprite,
              content: content,
              polyfill: polyfillContent,
              state: 'window.state=' + serialize(application.dehydrate(context)) + ';',
              livereload: process.env.NODE_ENV === "development" ? '//localhost:9000/' : rootPath,
              locale: 'window.locale="' + locale + '"'
            }
          )
        )

        res.send('<!doctype html>' + html);
      }
      if (!initialState) {
        res.status(404).send("Not found!");
      }
      else {
        if (initialState.components[initialState.components.length-1] &&
          initialState.components[initialState.components.length-1].loadAction) {
            context.getActionContext().executeAction(
              initialState.components[initialState.components.length-1].loadAction,
              {params:initialState.params, query:initialState.location.query}).then(render)
        } else {
          render()
        }
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
