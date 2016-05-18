React            = require 'react'
isBrowser        = window?
Popup            = if isBrowser then require('./dynamic-popup').default
SearchActions    = require '../../action/SearchActions'
intl             = require 'react-intl'
Icon          = require '../icon/icon'

class OriginPopup extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired

  componentDidMount: =>
    if @props.shouldOpen
      setImmediate @display

  display: () =>
    @props.popupContainer.openPopup()

  render: =>
    <Popup
      context={@context}
      ref="popup"
      map={@props.map}
      layerContainer={@props.layerContainer}
      popupContainer={@props.popupContainer}
      offset={[50, @props.yOffset]}
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
