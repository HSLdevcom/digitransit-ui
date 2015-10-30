if (process.env.NODE_ENV == 'production') {
  var raven = require('raven');
}
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

/* History management */
var createHistory = require('history/lib/createMemoryHistory');
var useQueries = require('history/lib/useQueries');
var useBasename = require('history/lib/useBasename');

var FluxibleComponent = require('fluxible-addons-react/FluxibleComponent');
var IntlProvider = require('react-intl').IntlProvider;
var serialize = require('serialize-javascript');
var polyfillService = require('polyfill-service');

/********** Global **********/
var port = process.env.PORT || 8080
var app = express()

/********** Application **********/
var application = require('../app/app')
var translations = require('../app/translations')
var config = require('../app/config')
var appRoot = process.cwd() + "/"
var applicationHtml = require('../app/html')
var svgSprite = fs.readFileSync(appRoot + 'static/svg-sprite.svg')
if (process.env.NODE_ENV !== "development") {
  var css = fs.readFileSync(appRoot + '_static/css/bundle.css')
}
var translations = require('../app/translations')
// Cache fonts from google, so that we don't need an additional roud trip to fetch font definitions
var fonts = ""
fetch(config.URL.FONT).then(function(res){
  res.text().then(function(text){
    fonts = text
  })
})

/* Setup functions */
function setUpStaticFolders() {
  var staticFolder = appRoot + "/_static"
  var cssFolder = path.join(staticFolder, 'css')
  app.use(config.ROOT_PATH + "/css", express.static(cssFolder))
  var jsFolder = path.join(staticFolder, 'js')
  app.use(config.ROOT_PATH + "/js", express.static(jsFolder))
  var mapFontsFolder = path.join(staticFolder, 'map', 'fonts')
  app.use(config.ROOT_PATH + "/mapFonts", express.static(mapFontsFolder, {
    setHeaders: function(res) {res.setHeader("Content-Encoding","gzip")}
  }))
  var mapFolder = path.join(staticFolder, 'map')
  app.use(config.ROOT_PATH + "/map", express.static(mapFolder))
  var iconFolder = path.join(staticFolder, 'icon')
  app.use(config.ROOT_PATH + "/icon", express.static(iconFolder))
  var imgFolder = path.join(staticFolder, 'img')
  app.use(config.ROOT_PATH + "/img", express.static(imgFolder))
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

function getPolyfills(userAgent) {
  return polyfillService.getPolyfillString({
    uaString: userAgent,
    features: {
      'matchMedia': {flags: ['gated']},
      'fetch': {flags: ['gated']},
      'Promise': {flags: ['gated']},
      'String.prototype.repeat': {flags: ['gated']},
      'Intl': {flags: ['gated']},
      'Object.assign': {flags: ['gated']},
      'Array.prototype.find': {flags: ['gated']},
      'es5': {flags: ['gated']},
    },
    minify: true,
    unknown: 'polyfill'
  });
}


function setupErrorHandling(){
  if(process.env.NODE_ENV == 'production') {
    app.use(raven.middleware.express.errorHandler(process.env.SENTRY_SECRET_DSN));
  }

  app.use(onError);
}

function setUpRoutes() {
  app.use(function (req, res, next) { // pass in `req.url` and the router will immediately match
    var locale = req.cookies.lang  || req.acceptsLanguages(['fi', 'sv', 'en']) || 'en';
    var messages = translations[locale]
    var context = application.createContext()
    var location = useBasename(useQueries(createHistory))({basename: config.ROOT_PATH}).createLocation(req.url);

    match({routes: application.getComponent(), location: location}, function (error, redirectLocation, renderProps) {
      if (redirectLocation) {
        res.redirect(301, redirectLocation.pathname + redirectLocation.search)
      }
      else if (error) {
        return next(error);
      }
      else if (renderProps == null) {
        res.status(404).send('Not found')
      }
      else {

        var promises = [getPolyfills(req.headers['user-agent'])]
        if (renderProps.components[1].loadAction){
          renderProps.components[1].loadAction(renderProps.params).forEach(function (action){
            promises.push(context.executeAction(action[0], action[1]))
          })
        }

        Promise.all(promises).then(function(results) {
          var polyfills = results[0];
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
                livereload: process.env.NODE_ENV === "development" ? '//localhost:9000/' : config.ROOT_PATH + "/",
                locale: 'window.locale="' + locale + '"',
                fonts: fonts
              }
            )
          )

          res.send('<!doctype html>' + html);
        }).catch(function(err) {
          if(err)
            return next(err);
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
setupRaven()
setUpStaticFolders()
setUpMiddleware()
setUpRoutes()
setupErrorHandling()
startServer()
module.exports.app = app
