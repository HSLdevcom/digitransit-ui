React           = require 'react'
Icon            = require '../icon/icon'
cx              = require 'classnames'
MapTrackAction  = require '../../action/map-track-actions'


class ToggleMapTracking extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  handleClick: ->
    if !@context.getStore('MapTrackStore').getMapTrackState()
      @context.executeAction MapTrackAction.startMapTrack
    else
      @context.executeAction MapTrackAction.endMapTrack

  render: ->
    <div className="toggle-positioning-container" onClick={@handleClick}>
      <Icon img={'icon-icon_mapMarker-location'}
            className={cx "icon-mapMarker-toggle-positioning-online": @props.tracking,
                           "icon-mapMarker-toggle-positioning-offline": !@props.tracking}/>
    </div>

module.exports = ToggleMapTracking
