fs = require('fs')

require('babel-core/register')(
  ignore: /node_modules\/(?!history|react-router)/
)

### React ###
React = require('react')
ReactDOM = require('react-dom/server')

### Route and history management ###
match = require('react-router/lib/match')
RouterContext = require('react-router/lib/RouterContext')
createHistory = require('react-router/lib/createMemoryHistory')

### Fluxible ###
FluxibleComponent = require('fluxible-addons-react/FluxibleComponent')
serialize = require('serialize-javascript')

### Other libraries ###
{IntlProvider} = require 'react-intl'
polyfillService = require 'polyfill-service'
getMuiTheme = require('material-ui/styles/getMuiTheme').default
MuiThemeProvider = require('material-ui/styles/MuiThemeProvider').default

### Application ###
application = require('./app').default
config = require('./config')
meta = require('./meta')
translations = require('./translations')
ApplicationHtml = require('./html').default

port = process.env.HOT_LOAD_PORT || 9000


# Look up paths for various asset files
appRoot = process.cwd() + '/'
if process.env.NODE_ENV != 'development'
  stats = require('../stats.json')
  manifest = fs.readFileSync(appRoot + "_static/" + stats.assetsByChunkName.manifest[0])

svgSprite = fs.readFileSync(appRoot + "static/svg-sprite.#{config.CONFIG}.svg").toString()

geolocationStarter = fs.readFileSync(appRoot + "static/geolocation.js").toString()

if process.env.NODE_ENV != 'development'
  css = [
    <link rel="stylesheet" type="text/css" href={config.APP_PATH + '/' + stats.assetsByChunkName.main[1]}/>
    <link rel="stylesheet" type="text/css" href={config.APP_PATH + '/' + stats.assetsByChunkName[config.CONFIG + '_theme'][1]}/>
  ]

getPolyfills = (userAgent) ->
  if !userAgent or /(LG-|GT-|SM-|SamsungBrowser|Google Page Speed Insights)/.test(userAgent)
    # Do not trust Samsung, LG
    # see https://digitransit.atlassian.net/browse/DT-360
    # https://digitransit.atlassian.net/browse/DT-445
    userAgent = ''

  features =
    'matchMedia': flags: ['gated']
    'fetch': flags: ['gated']
    'Promise': flags: ['gated']
    'String.prototype.repeat': flags: ['gated']
    'String.prototype.endsWith': flags: ['gated']
    'String.prototype.startsWith': flags: ['gated']
    'Intl': flags: ['always', 'gated']
    'Object.assign': flags: ['gated']
    'Array.prototype.find': flags: ['gated']
    'es5': flags: ['gated']
    'atob': flags: ['gated']
    'setImmediate': flags: ['gated']

  for language in config.availableLanguages
    features['Intl.~locale.' + language] = flags: ['always', 'gated']

  polyfillService.getPolyfillString
    uaString: userAgent
    features: features
    minify: true
    unknown: 'polyfill'

processFeedback = (req, res) ->
  if req.headers.dnt == 1
    return

  visitCount = req.cookies.vc | 0
  res.cookie 'vc', visitCount + 1

getScripts = (req) ->
  if process.env.NODE_ENV == 'development'
    host = req.headers['host']?.split(':')[0] or 'localhost'
    <script async src={"//#{host}:#{port}/js/bundle.js"}/>
  else
    [
      <script dangerouslySetInnerHTML={ __html: manifest }/>,
      <script src={config.APP_PATH + '/' + stats.assetsByChunkName.common[0]}/>,
      <script src={config.APP_PATH + '/' + stats.assetsByChunkName.leaflet[0]}/>,
      <script src={config.APP_PATH + '/' + stats.assetsByChunkName.main[0]}/>
    ]

getContent = (context, renderProps, locale, userAgent) ->
  # Ugly way to see if this is a Relay RootComponent
  # until Relay gets server rendering capabilities
  if renderProps.components.some(((i) -> i instanceof Object and i.hasFragment))
    return ''

  # TODO: This should be moved to a place to coexist with similar content from client.cjsx
  ReactDOM.renderToString(
    <FluxibleComponent context={context.getComponentContext()}>
      <IntlProvider locale={locale} messages={translations[locale]}>
        <MuiThemeProvider muiTheme={getMuiTheme {}, userAgent: userAgent}>
          <RouterContext {...renderProps}/>
        </MuiThemeProvider>
      </IntlProvider>
    </FluxibleComponent>
  )

getHtml = (context, renderProps, locale, polyfills, req) ->
  ReactDOM.renderToStaticMarkup <ApplicationHtml
    css={if process.env.NODE_ENV == 'development' then false else css}
    svgSprite={svgSprite}
    content={
      ""
      #TODO: temporarely disable server-side rendering in order to fix issue with having different content from the server, which breaks leaflet integration
      #getContent(context, renderProps, locale, req.headers['user-agent'])
    }
    polyfill={polyfills}
    state={'window.state=' + serialize(application.dehydrate(context)) + ';'}
    locale={locale}
    scripts={getScripts(req)}
    fonts={config.URL.FONT}

    config={'window.config=' + JSON.stringify(config)}
    geolocationStarter={geolocationStarter}
  />

module.exports = (req, res, next) ->
  # pass in `req.url` and the router will immediately match
  processFeedback req, res
  locale = req.cookies.lang or req.acceptsLanguages(config.availableLanguages) or config.defaultLanguage
  context = application.createContext()
  #required by material-ui
  global.navigator = userAgent: req.headers['user-agent']
  location = createHistory(basename: config.APP_PATH).createLocation(req.url)

  match {routes: context.getComponent(), location: location}
  , (error, redirectLocation, renderProps) ->
    if redirectLocation
      res.redirect 301, redirectLocation.pathname + redirectLocation.search
    else if error
      return next(error)
    else if !renderProps
      res.status(404).send 'Not found'
    else
      promises = [getPolyfills(req.headers['user-agent'])]
      if renderProps.components[1].loadAction
        renderProps.components[1].loadAction(renderProps.params).forEach (action) ->
          promises.push context.executeAction(action[0], action[1])
      Promise.all(promises).then((results) ->
        res.send '<!doctype html>' + getHtml context, renderProps, locale, results[0], req
      ).catch (err) -> return next(err) if err
