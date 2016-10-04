React  = require 'react'
Splash = require './splash'
pure   = require('recompose/pure').default
connectToStores = require 'fluxible-addons-react/connectToStores'

SplashOrComponent = ({displaySplash, state, children}) ->
  <Splash displaySplash={displaySplash} state={state}>{children}</Splash>

module.exports = connectToStores SplashOrComponent, ['PositionStore', 'EndpointStore'], (context, props) ->
  locationState = context.getStore('PositionStore').getLocationState()
  origin = context.getStore('EndpointStore').getOrigin()
  useCurrentPosition = origin.useCurrentPosition

  #if origin = current position and no position
  displaySplash: (useCurrentPosition and not locationState.hasLocation) or
    (!useCurrentPosition and (!origin.lat or !origin.lon))
  state: if locationState.status == 'no-location' then 'load' else 'positioning'
  children: props.children
