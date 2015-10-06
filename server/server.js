/********** Server **********/
var express = require('express')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var fs = require('fs')
var path = require('path')

/********** Polyfills (for node) **********/
require('node-cjsx').transform();
require("babel/register")({stage: 0});

global.fetch = require('node-fetch');
global.self = {fetch: global.fetch};

// XXX Test on new node 4.0 release
global.Intl = require('intl');

/********** Libraries **********/
var React = require('react')
var ReactDOM = require('react-dom/server')
var match = require('react-router/lib/match')
var RoutingContext = require('react-router/lib/RoutingContext')
var createLocation = require('history/lib/createLocation');
var FluxibleComponent = require('fluxible-addons-react/FluxibleComponent');
var IntlProvider = require('react-intl').IntlProvider;
var serialize = require('serialize-javascript');
var polyfillService = require('polyfill-service');

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
var translations = require('../app/translations')

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

function getPolyfills(userAgent) {
  return polyfillService.getPolyfillString({
    uaString: userAgent,
    features: {
      'Function.prototype.bind': {flags: ['gated']},
      'matchMedia': {flags: ['gated']},
      'fetch': {flags: ['gated']},
      'Promise': {flags: ['gated']},
      'String.prototype.repeat': {flags: ['gated']},
      'Intl': {flags: ['gated']},
      'Object.assign': {flags: ['gated']},
    },
    minify: true,
    unknown: 'polyfill'
  });
}

function setUpRoutes() {
  app.use(function (req, res, next) { // pass in `req.url` and the router will immediately match
    var locale = req.query.locale || req.acceptsLanguages(['fi', 'sv', 'en']) || 'en';
    var messages = translations[locale]
    var context = application.createContext()
    var location = createLocation(req.url);

    match({routes: application.getComponent(), location: location}, function (error, redirectLocation, renderProps) {
      if (redirectLocation) {
        res.redirect(301, redirectLocation.pathname + redirectLocation.search)
      }
      else if (error) {
        res.status(500).send(error.message)
      }
      else if (renderProps == null) {
        res.status(404).send('Not found')
      }
      else {
        var promises = [getPolyfills(req.headers['user-agent'])];
        promises.concat(renderProps.components.map(function(component){
          if (component instanceof Object && component.loadAction) {
            return context.getActionContext().executeAction(component.loadAction,
              {params:renderProps.params, query:renderProps.location.query});
          } else {
            return true;
          }
        }));
        Promise.all(promises).then(function(polyfills){
          var content = "";
          // Ugly way to see if this is a Relay RootComponent
          // until Relay gets server rendering capabilities
          if (!renderProps.components.some(function(i){return (i instanceof Object && i.getQuery)})){
            // TODO: This should be moved to a place to coexist with similar content from client.coffee
            content = ReactDOM.renderToString(
              React.createElement(
                FluxibleComponent,
                { context: context.getComponentContext() },
                React.createElement(
                  IntlProvider,
                  { locale: locale,
                    messages: translations[locale]
                  },
                  React.createElement(
                    RoutingContext,
                    { history: renderProps.history,
                      createElement: React.createElement,
                      location: renderProps.location,
                      routes: renderProps.routes,
                      params: renderProps.params,
                      components: renderProps.components
                    }
                  )
                )
              )
            );
          };

          var html = ReactDOM.renderToStaticMarkup(
            React.createElement(
              applicationHtml,
              {
                css: process.env.NODE_ENV === "development" ? false : css,
                svgSprite: svgSprite,
                content: content,
                polyfill: polyfills,
                state: 'window.state=' + serialize(application.dehydrate(context)) + ';',
                livereload: process.env.NODE_ENV === "development" ? '//localhost:9000/' : rootPath,
                locale: 'window.locale="' + locale + '"'
              }
            )
          )

          res.send('<!doctype html>' + html);
        }).catch(function(err) {
          console.log(err);
          res.status(500).send(err);
        });
      }
    });
  });
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
