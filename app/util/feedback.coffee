reactCookie   = if window? then require 'react-cookie' else null
config = require '../config'
#call when "user returns to frontpage"
# time (currentTime) in ms
shouldDisplayPopup = (time) ->
  if window? and config.feedback.enable
    visitCount = reactCookie.load('vc')
    if visitCount > 1
      feedbackInteractionDate = reactCookie.load('fid')
      if feedbackInteractionDate == undefined or feedbackInteractionDate == null or (time - feedbackInteractionDate) >= 30 * 24 * 60 * 60 * 1000
        return true
  false

# time (currentTime) in ms
recordResult = (piwik, time, nps, prefer_new, feedback) ->
  reactCookie.save 'fid', time, 'path': '/'
  if nps != undefined
    piwik.setCustomVariable 1, 'nps', nps, 'visit'
    piwik.trackEvent "Feedback", "Set", "nps", nps
  if prefer_new != undefined
    piwik.setCustomVariable 2, 'prefer_new', prefer_new, 'visit'
    piwik.trackEvent "Feedback", "Set", "prefer_new", prefer_new
  if feedback
    piwik.setCustomVariable 3, 'feedback', feedback, 'visit'
    piwik.trackEvent "Feedback", "Set", "feedback", feedback
  if nps != undefined or prefer_new != undefined or feedback != undefined
    piwik.trackEvent "Feedback", "Close"

module.exports =
  shouldDisplayPopup: shouldDisplayPopup
  recordResult: recordResult
