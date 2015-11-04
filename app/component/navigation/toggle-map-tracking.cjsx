React           = require 'react'
Icon            = require '../icon/icon'

class ToggleMapTracking extends React.Component
  @propTypes:
    enableMapTracking: React.PropTypes.func.isRequired
    disableMapTracking: React.PropTypes.func.isRequired
    tracking: React.PropTypes.bool.isRequired

  render: ->
    <div className="toggle-positioning-container" onClick={@props.handleClick}>
      <Icon img='icon-icon_mapMarker-location' className={@props.className}/>
    </div>

module.exports = ToggleMapTracking
