React            = require 'react'
isBrowser        = window?
Popup            = if isBrowser then require './dynamic-popup'
SearchActions    = require '../../action/search-actions'
intl             = require 'react-intl'

class OriginPopup extends React.Component

  constructor: ->
    super
    @state =
      position: []

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: =>
    @context.getStore('PositionStore').addChangeListener @onPositionChange
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange

  componentWillUnmount: =>
    @context.getStore('PositionStore').removeChangeListener @onPositionChange
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange

  display: () =>
    @props.map.openPopup(@refs.popup._leafletElement)
    close = () =>
      if @toref
        @toref = undefined
      @props.map.closePopup()

    if (@toref)
      clearTimeout @toRef
    @toref = setTimeout close,  5000

  onEndpointChange: (endPointChange) =>
    if endPointChange in ['set-origin']
      origin = @context.getStore('EndpointStore').getOrigin()
      @setState
        msg: origin.address
        position: origin,
        @display


  onPositionChange: (status) =>
    coordinates = @context.getStore('PositionStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      msg = @context.intl.formatMessage
        id: 'own-position'
        defaultMessage: 'Your current position'

      @setState
        msg: msg
        position: [coordinates.lat, coordinates.lon],
        @display

  render: ->
    msg = @context.intl.formatMessage
      id: 'origin'
      defaultMessage: 'Origin'

    <Popup context={@context} ref="popup" latlng={@state.position}
      options={
        offset: [0, 0]
        closeButton: false
        maxWidth: config.map.genericMarker.popup.maxWidth
        className: @props.className}>
        <div onClick={() =>
          @context.executeAction SearchActions.openDialog, "origin"}>
          <span className="h4 bold uppercase">{msg}</span><br/>{@state.msg}
        </div>
    </Popup>

module.exports = OriginPopup
