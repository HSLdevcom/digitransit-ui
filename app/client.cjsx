# Set up logging to Sentry
if process.env.NODE_ENV == 'production'
  Raven = require 'raven-js'
  Raven.config(process.env.SENTRY_DSN).install()

  # Rebind console.error if it exists so that we can catch async exceptions from React
  # We want the original 'this' here so don't use =>

  if window.console
    console_error = console.error

    # Fix console.error.apply etc. for IE9
    if typeof console.log == "object"
      ["log", "info", "warn", "error", "assert", "dir", "clear", "profile", "profileEnd"]
      .forEach(
        ((method) -> console[method] = @bind(console[method], console))
        , Function.prototype.call)

    console.error = (message, error) ->
      Raven.captureException(error)
      console_error.apply(this, arguments)

  else
    window.console = error: (message, error) -> Raven.captureException(error)

# Libraries
React             = require 'react'
ReactDOM          = require 'react-dom'
Router            = require 'react-router/lib/Router'
Relay             = require 'react-relay'
ReactRouterRelay  = require 'react-router-relay'
createHistory     = require 'history/lib/createBrowserHistory'
useBasename       = require 'history/lib/useBasename'
useQueries        = require 'history/lib/useQueries'
FluxibleComponent = require 'fluxible-addons-react/FluxibleComponent'
isEqual           = require 'lodash/lang/isEqual'
config            = require './config'
StoreListeningIntlProvider = require './util/store-listening-intl-provider'
app               = require './app'
translations      = require './translations'
PositionActions     = require './action/position-actions.coffee'

dehydratedState   = window.state # Sent from the server

require "../sass/main.scss"

window._debug = require 'debug' # Allow _debug.enable('*') in browser console

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer("#{config.URL.OTP}index/graphql")
)

# Run application
app.rehydrate dehydratedState, (err, context) ->
  if err
    throw err
  window.context = context

  # We include IntlProvider here, because on the server it's done in server.js,
  # which ignores this file. Unfortunately contexts don't propagate if we put
  # it into routes.js, which is used by both server and client.
  # If you change how the locales and messages are loaded, change server.js too.
  ReactDOM.render(
    <FluxibleComponent context={context.getComponentContext()}>
      <StoreListeningIntlProvider translations={translations}>
        <Router
          history={useBasename(useQueries(createHistory))(basename: config.ROOT_PATH)}
          children={app.getComponent()}
          createElement={ReactRouterRelay.createElement}
        />
      </StoreListeningIntlProvider>
    </FluxibleComponent>, document.getElementById('app')
  )

  # Fetch all alerts after rendering has commenced
  context.getActionContext().executeAction require('./action/disruption-actions').getDisruptions

  #start positioning
  if window?
    @context.executeAction PositionActions.startLocationWatch
