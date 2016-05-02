React  = require 'react'
Splash = require './splash'

class SplashOrComponent extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('PositionStore').addChangeListener @onPositionChange
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: ->
    @context.getStore('PositionStore').removeChangeListener @onPositionChange
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

  onPositionChange: (status) =>
    if status?.statusChanged
      @forceUpdate()

  onEndpointChange: (status) =>
    if status == 'set-origin'
      @forceUpdate()

  render: ->
    positionStore = @context.getStore('PositionStore')
    endpointStore = @context.getStore('EndpointStore')

    #if origin = current position and no position
    displaySplash = endpointStore.getOrigin().useCurrentPosition and not positionStore.getLocationState().hasLocation
    state = if positionStore.getLocationState().status == 'no-location' then 'load' else 'positioning'

    <div className="fullscreen">
      {if displaySplash  then <Splash state={state}/> else @props.children}
    </div>


module.exports = SplashOrComponent
