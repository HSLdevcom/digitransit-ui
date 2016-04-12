moment = require 'moment'

# converts the given parameter into a string in format HHmm
# Input: time - seconds since midnight
getStartTime = (time) ->
  hours = ('0' + Math.floor(time / 60 / 60 )).slice(-2)
  mins = ('0' + (time / 60 % 60)).slice(-2)
  return hours + mins

# renders trip duration to string
# input: time duration - milliseconds
durationToString = (duration) ->
  duration = moment.duration(duration)

  if duration.asHours() >= 1
    durationText = "#{duration.hours() + duration.days() * 24} h #{duration.minutes()} min"
  else
    durationText = "#{duration.minutes()} min"

  return durationText

module.exports =
  getStartTime: getStartTime
  durationToString: durationToString
