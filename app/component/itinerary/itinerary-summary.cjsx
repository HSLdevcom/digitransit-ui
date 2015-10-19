React = require 'react'
moment = require 'moment'
cx = require 'classnames'
ItineraryDuration = require './itinerary-duration'
ItineraryWalkDistance = require "./itinerary-walk-distance"

class ItinerarySummary extends React.Component

  ItinerarySummary.description =
    "Displays itinerary summary row; itinerary's duration and walk distance"

  ItinerarySummary.propTypes =
    itinerary: React.PropTypes.object.isRequired

  render: ->
    <div className={cx 'itinerary-summary', @props.className}>
      <ItineraryDuration itinerary={@props.itinerary}/>
        {@props.children}
      <ItineraryWalkDistance itinerary={@props.itinerary}/>
    </div>

module.exports = ItinerarySummary
