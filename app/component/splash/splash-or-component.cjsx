React  = require 'react'
Splash = require './splash'
pure   = require('recompose/pure').default
connectToStores = require 'fluxible-addons-react/connectToStores'

SplashOrComponent = (Component) -> pure ({displaySplash, state}) ->
  if displaySplash then <Splash state={state}/> else <Component/>

module.exports = (component) -> connectToStores SplashOrComponent(component), ['PositionStore', 'EndpointStore'], (context, props) ->
  locationState = context.getStore('PositionStore').getLocationState()
  useCurrentPosition = context.getStore('EndpointStore').getOrigin().useCurrentPosition

  #if origin = current position and no position
  displaySplash: useCurrentPosition and not locationState.hasLocation
  state: if locationState.status == 'no-location' then 'load' else 'positioning'
