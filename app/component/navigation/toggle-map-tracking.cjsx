React           = require 'react'
Icon            = require '../icon/icon'
cx              = require 'classnames'


class ToggleMapTracking extends React.Component
  @propTypes:
    enableMapTracking: React.PropTypes.func.isRequired
    disableMapTracking: React.PropTypes.func.isRequired
    tracking: React.PropTypes.bool.isRequired

  handleClick: =>
    if !@props.tracking
      @props.enableMapTracking()
    else
      @props.disableMapTracking()

  render: ->
    <div className="toggle-positioning-container" onClick={@handleClick}>
      <Icon img={'icon-icon_mapMarker-location'}
            className={cx "icon-mapMarker-toggle-positioning-online": @props.tracking,
                           "icon-mapMarker-toggle-positioning-offline": !@props.tracking}/>
    </div>

module.exports = ToggleMapTracking
