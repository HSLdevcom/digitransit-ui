reactCookie   = if window? then require 'react-cookie' else null

#call when "user returns to frontpage"
# time (currentTime) in ms
shouldDisplayPopup = (time) ->
  if window?
    visitCount = reactCookie.load('vc')
    if visitCount > 1
      feedbackInteractionDate = reactCookie.load('fid')
      if feedbackInteractionDate == undefined or feedbackInteractionDate == null or (time - feedbackInteractionDate) >= 30 * 24 * 60 * 60 * 1000
        return true
  false

# time (currentTime) in ms
recordResult = (piwik, time, a1, a2, a3) ->
  reactCookie.save 'fid', time, 'path': '/'
  if a1 then piwik.setCustomVariable 1, 'nps', a1, 'visit'
  if a2 then piwik.setCustomVariable 2, 'prefer_new', a2, 'visit'
  if a3 then piwik.setCustomVariable 3, 'feedback', a3, 'visit'
  if a1 or a2 or a3
    piwik.trackEvent "Feedback"

module.exports =
  shouldDisplayPopup: shouldDisplayPopup
  recordResult: recordResult
