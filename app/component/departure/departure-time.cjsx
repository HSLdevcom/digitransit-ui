React       = require 'react'
timeUtils   = require '../../util/time-utils'
cx          = require 'classnames'

class DepartureTime extends React.Component
  @description:
    "Display time in correct format. Displays minutes for 20 minutes, othervice
    in HH:mm format. Also, it takes into account if the time is realtime"

  @propTypes:
    departureTime:  React.PropTypes.number.isRequired
    realtime:       React.PropTypes.bool
    currentTime:    React.PropTypes.number.isRequired

  render: ->
    <span className={cx "time", "realtime":@props.realtime}>
      {timeUtils.renderDepartureStoptime @props.departureTime, @props.realtime, @props.currentTime}
    </span>

module.exports = DepartureTime
