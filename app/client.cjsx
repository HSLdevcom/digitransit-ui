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

dehydratedState   = window.state; # Sent from the server

require "../sass/main.scss"

window._debug = require 'debug' # Allow _debug.enable('*') in browser console

Relay.injectNetworkLayer(
  new Relay.DefaultNetworkLayer("#{config.URL.OTP}index/graphql")
);

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
        <Router history={History()} children={app.getComponent()}
                createElement={ReactRouterRelay.createElement} onUpdate={() ->
            if @state.components[@state.components.length-1].loadAction
              context.getActionContext().executeAction(
                @state.components[@state.components.length-1].loadAction,
                {params: @state.params, query: @state.location.query}
              )
          }
        />
      </StoreListeningIntlProvider>
    </FluxibleComponent>, document.getElementById('app')
  )

  # Fetch all alerts after rendering has commenced
  context.getActionContext().executeAction require('./action/disruption-actions').getDisruptions
