# Libraries
React             = require 'react'
Router            = require 'react-router'
FluxibleComponent = require 'fluxible/addons/FluxibleComponent'

app               = require './app'

dehydratedState   = window.state; # Sent from the server

require "../sass/main.scss"

require.include 'leaflet' # Force into main bundle.js

RenderApp = (context, Handler) ->
  React.render(
  	<FluxibleComponent context={context.getComponentContext()}>
  		<Handler/>
  	</FluxibleComponent>, document.getElementById('app'))


# Run application
app.rehydrate dehydratedState, (err, context) ->
  if err
    throw err
  window.context = context

  firstRender = true
  Router.run app.getComponent(), Router.HistoryLocation, (Handler, state) ->
    if firstRender 
      # Don't call the action on the first render on top of the server rehydration
      # Otherwise there is a race condition where the action gets executed before
      # render has been called, which can cause the checksum to fail.
      RenderApp context, Handler
      firstRender = false
    else
      #context.executeAction navigateAction, state, () ->
        RenderApp context, Handler