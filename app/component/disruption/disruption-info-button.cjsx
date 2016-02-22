React   = require 'react'
Relay   = require 'react-relay'
queries = require '../../queries'
Icon    = require '../icon/icon'
config  = require '../../config'

class DisruptionInfoButton extends React.Component
  @propTypes:
    toggleDisruptionInfo: React.PropTypes.func
    alerts: React.PropTypes.object

  render: ->
    if !config.disruption or config.disruption.showInfoButton
      disruptionIconClass = if @props.alerts.alerts.length > 0 then 'active' else 'inactive'
      <div onClick={@props.toggleDisruptionInfo} className="icon-holder cursor-pointer disruption-info">
        <Icon img={'icon-icon_caution'} className={'icon disruption-info ' + disruptionIconClass} />
      </div>
    else
      return null

module.exports = Relay.createContainer DisruptionInfoButton,
  fragments: queries.DisruptionInfoButtonFragments
