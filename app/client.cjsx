# Libraries
React             = require 'react'
ReactDOM          = require 'react-dom'
Router            = require 'react-router/lib/Router'
History           = require('react-router/lib/BrowserHistory').history
FluxibleComponent = require 'fluxible-addons-react/FluxibleComponent'
isEqual           = require 'lodash/lang/isEqual'

app               = require './app'

dehydratedState   = window.state; # Sent from the server

require "../sass/main.scss"

require.include 'leaflet' # Force into main bundle.js

window._debug = require 'debug' # Allow _debug.enable('*') in browser console

#injectTapEventPlugin = require "react-tap-event-plugin"
#injectTapEventPlugin()

# Run application
app.rehydrate dehydratedState, (err, context) ->
  if err
    throw err
  window.context = context

  ReactDOM.render(
  	<FluxibleComponent context={context.getComponentContext()}>
		  <Router history={History} children={app.getComponent()} onUpdate={() ->
        if context.getActionContext().executeAction
          context.getActionContext().executeAction(
            @state.components[@state.components.length-1].loadAction,
            {params: @state.params, query: @state.location.query}
          )
        }
      />
	 </FluxibleComponent>, document.getElementById('app'))
