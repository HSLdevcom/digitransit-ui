React       = require 'react'
Icon        = require '../icon/icon'
cx          = require 'classnames'
timeUtils   = require '../../util/time-utils'

Duration = (props) ->

  duration = timeUtils.durationToString(props.duration*1000)

  <span className={cx props.className}>
    <Icon img={'icon-icon_time'}/>
    <span className="duration">
      &nbsp;{duration}
    </span>
  </span>

Duration.description =
  "Displays itinerary's duration in minutes, and a time icon next to it.
  Takes duration in seconds as props"

Duration.propTypes =
  duration: React.PropTypes.number.isRequired

Duration.displayName = "Duration"

module.exports = Duration
