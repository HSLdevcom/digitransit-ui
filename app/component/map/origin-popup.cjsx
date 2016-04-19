React            = require 'react'
isBrowser        = window?
Popup            = if isBrowser then require './dynamic-popup'
SearchActions    = require '../../action/search-actions'
intl             = require 'react-intl'

class OriginPopup extends React.Component

  constructor: ->
    super
    @toref = undefined
    @state =
      position: undefined


  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: =>
    @context.getStore('EndpointStore').addChangeListener @onEndpointChange
    @context.getStore('PositionStore').addChangeListener @onPositionChange

  componentWillUnmount: =>
    @context.getStore('EndpointStore').removeChangeListener @onEndpointChange
    @context.getStore('PositionStore').removeChangeListener @onPositionChange

  display: () =>
    @props.map.openPopup(@refs.popup._leafletElement)
    close = () =>
      if typeof @toref != "undefined"
        @toref = undefined
      @props.map.closePopup()

    if typeof @toref != "undefined"
      clearTimeout @toref

    @toref = setTimeout close,  5000

  showCurrentPosition: () =>
    coordinates = @context.getStore('PositionStore').getLocationState()
    if coordinates and (coordinates.lat != 0 || coordinates.lon != 0)
      msg = @context.intl.formatMessage
        id: 'own-position'
        defaultMessage: 'Your current position'

      @setState
        msg: msg
        position: [coordinates.lat, coordinates.lon],
        () =>
          @display()

  onEndpointChange: (endPointChange) =>
    if endPointChange in ['set-origin']
      origin = @context.getStore('EndpointStore').getOrigin()
      if origin != undefined
        @setState
          msg: origin.address
          position: origin,
          @display
    else if endPointChange in ['origin-use-current']
      @showCurrentPosition()


  onPositionChange: () =>
    if not @state.position  #current position not shown yet
      @showCurrentPosition()

  render: =>
    if typeof @state?.position != "undefined"
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
    else
      <div/>

module.exports = OriginPopup
