if process.env.NODE_ENV == 'production'
  Raven = require 'raven-js'
  Raven.config(process.env.SENTRY_DSN).install()

  # Rebind console.error so that we can catch async exceptions from React
  console_error = console.error
  # this cannot be bound here, so never use =>
  console.error = (message, error) ->
    Raven.captureException(error)
    console_error.apply(this, arguments)

# Libraries
React             = require 'react'
ReactDOM          = require 'react-dom'
Router            = require 'react-router/lib/Router'
Relay             = require 'react-relay'
ReactRouterRelay  = require 'react-router-relay'
History           = require 'history/lib/createBrowserHistory'
FluxibleComponent = require 'fluxible-addons-react/FluxibleComponent'
isEqual           = require 'lodash/lang/isEqual'
config            = require './config'
StoreListeningIntlProvider = require './util/store-listening-intl-provider'
app               = require './app'
translations      = require './translations'

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
          history={History()}
          children={app.getComponent()}
          createElement={ReactRouterRelay.createElement}
        />
      </StoreListeningIntlProvider>
    </FluxibleComponent>, document.getElementById('app')
  )

  # Fetch all alerts after rendering has commenced
  context.getActionContext().executeAction require('./action/disruption-actions').getDisruptions
