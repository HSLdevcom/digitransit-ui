require './util/raven'
# Libraries
React             = require 'react'
ReactDOM          = require 'react-dom'
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
PositionActions   = require './action/position-actions.coffee'
piwik             = require('./util/piwik').getTracker(process.env.PIWIK_ADDRESS, process.env.PIWIK_ID)
dehydratedState   = window.state # Sent from the server

require "../sass/main.scss"

window._debug = require 'debug' # Allow _debug.enable('*') in browser console

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer("#{config.URL.OTP}index/graphql")
)

Raven?.setUserContext piwik: piwik.getVisitorId()

# Run application
app.rehydrate dehydratedState, (err, context) ->
  if err
    throw err
  window.context = context
  context.piwik = piwik

  # We include IntlProvider here, because on the server it's done in server.js,
  # which ignores this file. Unfortunately contexts don't propagate if we put
  # it into routes.js, which is used by both server and client.
  # If you change how the locales and messages are loaded, change server.js too.
  ReactDOM.render(
    <FluxibleComponent context={context.getComponentContext()}>
      <StoreListeningIntlProvider translations={translations}>
        <ReactRouterRelay.RelayRouter
          history={useBasename(useQueries(createHistory))(basename: config.ROOT_PATH)}
          children={app.getComponent()}
          onUpdate={() ->
            context.piwik.setCustomUrl(@history.createHref(@state.location))
            context.piwik.trackPageView()
          }
        />
      </StoreListeningIntlProvider>
    </FluxibleComponent>, document.getElementById('app')
  )

  # Fetch all alerts after rendering has commenced
  context.getActionContext().executeAction require('./action/disruption-actions').getDisruptions

  if window?
    #start positioning
    context.piwik.enableLinkTracking()
    context.executeAction PositionActions.startLocationWatch
