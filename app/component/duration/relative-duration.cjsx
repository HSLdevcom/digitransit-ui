React  = require 'react'
moment = require 'moment'
intl = require 'react-intl'
IntlMixin = intl.IntlMixin

FormattedMessage = intl.FormattedMessage

class RelativeDuration extends React.Component
  @contextTypes:
    intl: intl.intlShape.isRequired

  render: ->
    duration = moment.duration(@props.duration)
    hourShort = @context.intl.formatMessage {id: 'hour-short', defaultMessage: "h"}
    minuteShort = @context.intl.formatMessage {id: 'minute-short', defaultMessage: "min"}

    if duration.asHours() >= 1
      durationText = "#{duration.hours() + duration.days() * 24} #{hourShort} #{duration.minutes()} #{minuteShort}"
    else
      durationText = "#{duration.minutes()} #{minuteShort}"

    <span>{durationText}</span>

module.exports = RelativeDuration
