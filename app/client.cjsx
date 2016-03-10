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
isEqual           = require 'lodash/isEqual'
config            = require './config'
StoreListeningIntlProvider = require './util/store-listening-intl-provider'
app               = require './app'
translations      = require './translations'
PositionActions   = require './action/position-actions.coffee'
piwik             = require('./util/piwik').getTracker(config.PIWIK_ADDRESS, config.PIWIK_ID)
PiwikProvider     = require './component/util/piwik-provider'
dehydratedState   = window.state # Sent from the server
Feedback          = require './util/feedback'
FeedbackActions   = require './action/feedback-action'

if process.env.NODE_ENV == 'development'
  require "../sass/themes/#{config.CONFIG}/main.scss"

window._debug = require 'debug' # Allow _debug.enable('*') in browser console

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer("#{config.URL.OTP}index/graphql")
)

Raven?.setUserContext piwik: piwik.getVisitorId()

#Material-ui uses touch tap events
require('react-tap-event-plugin')()

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
      <PiwikProvider piwik={piwik}>
        <StoreListeningIntlProvider translations={translations}>
          <ReactRouterRelay.RelayRouter
            history={useBasename(useQueries(createHistory))(basename: config.APP_PATH)}
            children={app.getComponent()}
            onUpdate={() ->
              # track "getting back to home"
              newHref = @history.createHref(@state.location)
              if @href != undefined && newHref == "/" && @href != newHref
                if Feedback.shouldDisplayPopup(context.getComponentContext().getStore('TimeStore').getCurrentTime().valueOf())
                  context.executeAction FeedbackActions.openFeedbackModal
              @href = newHref
              piwik.setCustomUrl(@history.createHref(@state.location))
              piwik.trackPageView()
            }
          />
        </StoreListeningIntlProvider>
      </PiwikProvider>
    </FluxibleComponent>, document.getElementById('app')
  )

  if window?
    #start positioning
    piwik.enableLinkTracking()
    context.executeAction PositionActions.startLocationWatch
