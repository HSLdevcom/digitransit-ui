React            = require 'react'
isBrowser        = window?
Popup            = if isBrowser then require './dynamic-popup'
SearchActions    = require '../../action/search-actions'
intl             = require 'react-intl'
Icon          = require '../icon/icon'

class OriginPopup extends React.Component

  constructor: ->
    super
    @toref = undefined
    @state =
      position: undefined
      yOffset: 0

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: =>
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange
    @context.getStore('PositionStore').addChangeListener @onPositionChange
    if @context.getStore('EndpointStore').isPendingPopup()
      @showEndpoint()

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange
    @context.getStore('PositionStore').removeChangeListener @onPositionChange

  display: () =>
    @props.map.openPopup(@refs.popup._leafletElement)

  showCurrentPosition: () =>
    coordinates = @context.getStore('PositionStore').getLocationState()
    if coordinates.hasLocation
      msg = @context.intl.formatMessage
        id: 'own-position'
        defaultMessage: 'Your current position'

      @setState
        msg: msg
        yOffset: 0
        position: [coordinates.lat, coordinates.lon],
        @display

  showEndpoint: () =>
    origin = @context.getStore('EndpointStore').getOrigin()
    if origin != undefined
      @setState
        yOffset: -15
        msg: origin.address
        position: origin,
        @display


  onEndpointChange: (endPointChange) =>
    if endPointChange in ['set-origin']
      @showEndpoint()
    else if endPointChange in ['origin-use-current']
      @showCurrentPosition()


  onPositionChange: () =>
    if not @state.position  #current position not shown yet
      @showCurrentPosition()

  render: =>
    if typeof @state?.position != "undefined"
      msg = @context.intl.formatMessage
        id: 'origin'
        defaultMessage: 'From'

      <Popup context={@context} ref="popup" latlng={@state.position}
        options={
          offset: [50, @state.yOffset]
          closeButton: false
          maxWidth: config.map.genericMarker.popup.maxWidth
          className: "origin-popup"}>
          <div onClick={() =>
            @context.executeAction SearchActions.openDialog, "origin"}>
            <div className="origin-popup">{msg}<Icon className="right-arrow" img={'icon-icon_arrow-collapse--right'}/></div>
            <div>
              <div className="origin-popup-name">{@state.msg}</div>
              <div className="shade-to-white"></div>
            </div>
          </div>
      </Popup>
    else
      <div/>

module.exports = OriginPopup
