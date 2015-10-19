React = require 'react'
Icon  = require '../icon/icon'
moment = require 'moment'

ItineraryWalkDistance = (props) ->

  ItineraryWalkDistance.description =
    "Displays the total walk distance of the itinerary"

  ItineraryWalkDistance.propTypes =
    itinerary: React.PropTypes.object.isRequired

  <span>
    &nbsp;&nbsp;<Icon img={'icon-icon_walk'}/>
    &nbsp;{Math.round(props.itinerary.walkDistance/100)*100}m
  </span>

module.exports = ItineraryWalkDistance
