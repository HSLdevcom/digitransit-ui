React = require 'react'
moment = require 'moment'
cx    = require 'classnames'

TimeFrame = (props) ->

  <span className={cx props.className}>
  // {moment(props.startTime).format('HH:mm')} - {moment(props.endTime).format('HH:mm')}
  </span>

TimeFrame.description =
  "Displays the time frame of interval (example: // 15:55 - 16:15)"

TimeFrame.propTypes =
  startTime: React.PropTypes.number.isRequired
  endTime: React.PropTypes.number.isRequired

TimeFrame.displayName = "TimeFrame"

module.exports = TimeFrame
