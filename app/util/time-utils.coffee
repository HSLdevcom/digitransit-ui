


# converts the given parameter into a string in format HHmm
# Input: time - seconds since midnight
getStartTime = (time) ->
  hours = ('0' + Math.floor(time / 60 / 60 )).slice(-2)
  mins = ('0' + (time / 60 % 60)).slice(-2)
  return hours + mins


module.exports =
  getStartTime: getStartTime
