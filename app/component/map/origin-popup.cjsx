React            = require 'react'
isBrowser        = window?
Popup            = if isBrowser then require('./dynamic-popup').default
SearchActions    = require '../../action/search-actions'
intl             = require 'react-intl'
Icon          = require '../icon/icon'

class OriginPopup extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: =>
    setImmediate @display

  display: () =>
    @props.popupContainer.openPopup()

  showEndpoint: () =>
    origin = @context.getStore('EndpointStore').getOrigin()
    if origin != undefined
      @setState
        yOffset: -15
        msg: origin.address
        position: origin,
        @display

  render: =>
    <Popup
      context={@context}
      ref="popup"
      map={@props.map}
      layerContainer={@props.layerContainer}
      popupContainer={@props.popupContainer}
      offset={[50, 0]}
      closeButton={false}
      maxWidth={config.map.genericMarker.popup.maxWidth}
      className="origin-popup">
        <div onClick={() =>
          @context.executeAction SearchActions.openDialog, "origin"}>
          <div className="origin-popup">{@props.header}<Icon className="right-arrow" img={'icon-icon_arrow-collapse--right'}/></div>
          <div>
            <div className="origin-popup-name">{@props.text}</div>
            <div className="shade-to-white"></div>
          </div>
        </div>
    </Popup>

module.exports = OriginPopup
