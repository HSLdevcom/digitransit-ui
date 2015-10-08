moment            = require 'moment'

# converts the given parameter into a string in format HHmm
# Input: time - seconds since midnight
getStartTime = (time) ->
  hours = ('0' + Math.floor(time / 60 / 60 )).slice(-2)
  mins = ('0' + (time / 60 % 60)).slice(-2)
  return hours + mins


renderDepartureStoptime = (time, realtime, currentTime) ->
  if time < currentTime # In the past
    return (if realtime then "°" else "") + moment(time * 1000).format "HH:mm"
  if time > currentTime + 1200 # far away
    return (if realtime then "°" else "") + moment(time * 1000).format "HH:mm"
  else
    return (if realtime then "°" else "") + moment(time * 1000).diff(currentTime * 1000, 'm') + "min"

module.exports =
  getStartTime: getStartTime
  renderDepartureStoptime: renderDepartureStoptime
