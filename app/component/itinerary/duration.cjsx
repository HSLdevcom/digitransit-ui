React = require 'react'
Icon  = require '../icon/icon'
cx    = require 'classnames'

Duration = (props) ->

  <span className={cx props.className}>
    <Icon img={'icon-icon_time'}/>
    <span className="duration">
      &nbsp;{Math.round(props.duration/60)}min
    </span>
  </span>

Duration.description =
  "Displays itinerary's duration in minutes, and a time icon next to it.
  Takes duration in seconds as props"

Duration.propTypes =
  duration: React.PropTypes.number.isRequired

Duration.displayName = "Duration"

module.exports = Duration
