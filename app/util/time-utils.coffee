moment = require 'moment'

# converts the given parameter into a string in format HHmm
# Input: time - seconds since midnight
getStartTime = (time) ->
  hours = ('0' + Math.floor(time / 60 / 60 )).slice(-2)
  mins = ('0' + (time / 60 % 60)).slice(-2)
  return hours + mins

renderDepartureStoptime = (time, realtime, currentTime) ->
  departureTime = moment(time * 1000)

  if time < currentTime # In the past
    departureTime.format "HH:mm"
  else if time > currentTime + 1200 # far away
    departureTime.format "HH:mm"
  else if moment(currentTime * 1000).diff(departureTime, 'minutes') == 0
    "now"
  else
    departureTime.diff(currentTime * 1000, 'm') + "min"

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
  renderDepartureStoptime: renderDepartureStoptime
  durationToString: durationToString
