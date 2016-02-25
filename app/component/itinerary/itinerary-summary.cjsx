React = require 'react'
moment = require '../../util/moment-configured.js'
cx = require 'classnames'
Duration = require './duration'
WalkDistance = require "./walk-distance"

class ItinerarySummary extends React.Component

  render: ->
    <div className={cx 'itinerary-summary', @props.className}>
      <Duration duration={@props.itinerary.duration} className="duration--itinerary-summary"/>
        {@props.children}
      <WalkDistance walkDistance={@props.itinerary.walkDistance}/>
    </div>


ItinerarySummary.description =
  "Displays itinerary summary row; itinerary's duration and walk distance"

ItinerarySummary.propTypes =
  itinerary: React.PropTypes.object.isRequired

ItinerarySummary.displayName = "ItinerarySummary"

module.exports = ItinerarySummary
