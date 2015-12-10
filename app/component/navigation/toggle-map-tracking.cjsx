React           = require 'react'
Icon            = require '../icon/icon'

class ToggleMapTracking extends React.Component
  @propTypes:
    handleClick: React.PropTypes.func.isRequired
    className: React.PropTypes.string.isRequired

  render: ->
    <div className="toggle-positioning-container" onClick={@props.handleClick}>
      <Icon img='icon-icon_position' className={@props.className}/>
    </div>

module.exports = ToggleMapTracking
