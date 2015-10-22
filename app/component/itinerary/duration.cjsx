React = require 'react'
Icon  = require '../icon/icon'
cx    = require 'classnames'

Duration = (props) ->

  durationInMinutes = Math.round(props.duration/60)
  hours = Math.floor(props.duration / (60 * 60))
  divisor = props.duration % (60 * 60)
  minutes = Math.round(divisor / 60)

  duration = if durationInMinutes < 60 then "#{durationInMinutes}min" else "#{hours}h #{minutes}min"

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
