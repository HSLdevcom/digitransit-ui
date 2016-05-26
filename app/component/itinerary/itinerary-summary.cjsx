React = require 'react'
Duration = require './duration'
WalkDistance = require "./walk-distance"

ItinerarySummary = ({itinerary, children, className}) ->
  <div className='itinerary-summary'>
    <Duration duration={itinerary.duration} className="duration--itinerary-summary"/>
      {children}
    <WalkDistance walkDistance={itinerary.walkDistance}/>
  </div>

ItinerarySummary.description =
  "Displays itinerary summary row; itinerary's duration and walk distance"

ItinerarySummary.propTypes =
  itinerary: React.PropTypes.object.isRequired

ItinerarySummary.displayName = "ItinerarySummary"

module.exports = ItinerarySummary
