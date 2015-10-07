React       = require 'react'
timeUtils   = require '../../util/time-utils'
cx          = require 'classnames'

class DepartureTime extends React.Component
  PropTypes:
    time:         React.PropTypes.number.isRequired
    realtime:     React.PropTypes.bool
    currentTime:  React.PropTypes.number.isRequired

  render: ->
    <span className={cx "time", "realtime":@props.realtime}>
      {timeUtils.renderDepartureStoptime @props.time, @props.realtime, @props.currentTime}
    </span>

module.exports = DepartureTime
