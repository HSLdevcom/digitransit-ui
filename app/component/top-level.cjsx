React  = require 'react'
Helmet = require 'react-helmet'
meta   = require('../meta')
configureMoment = require '../util/configure-moment'
Splash = require '../page/splash.cjsx'

class TopLevel extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  @childContextTypes:
    location: React.PropTypes.object

  componentDidMount: ->
    @context.getStore('PositionStore').addChangeListener @onPositionChange
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: ->
    @context.getStore('PositionStore').removeChangeListener @onPositionChange
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

  onPositionChange: (status) =>
    console.log("status updated", status)
    if status?.statusChanged
      @forceUpdate()

  onEndpointChange: (status) =>
    console.log("endpoint changed", status)
    if status == 'set-origin'
      @forceUpdate()

  getChildContext: () ->
    location: @props.location

  render: ->
    positionStore = @context.getStore('PositionStore')
    endpointStore = @context.getStore('EndpointStore')
    preferencesStore = @context.getStore('PreferencesStore')

    #if origin = current position and no position
    displaySplash = endpointStore.getOrigin().useCurrentPosition and not positionStore.getLocationState().hasLocation
    state = if positionStore.getLocationState().status == 'no-location' then 'load' else 'positioning'

    language = preferencesStore.getLanguage()
    configureMoment(language)

    metadata = meta language
    <div className="fullscreen">
      <Helmet {...metadata}/>
      {if displaySplash  then <Splash state={state}/> else @props.children}
    </div>


module.exports = TopLevel
