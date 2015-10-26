moment             = require 'moment'

asString = (duration) ->
  duration = moment.duration(duration)

  if duration.hours() >= 1
    durationToString = "#{duration.hours()}h #{duration.minutes()}min"
  else
    durationToString = "#{duration.minutes()} min"

  return durationToString

module.exports=
  asString: asString
