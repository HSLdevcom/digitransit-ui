React = require 'react'
Icon  = require '../icon/icon'
moment = require 'moment'

ItineraryDuration = (props) ->

  ItineraryDuration.description =
    "Displays itinerary's duration in minutes, and a time icon next to it"

  ItineraryDuration.propTypes =
    itinerary: React.PropTypes.object.isRequired

  <span>
    <Icon img={'icon-icon_time'}/>
    <span className="itinerary-summary-duration">
      &nbsp;{Math.round(props.itinerary.duration/60)}min&nbsp;
    </span>
  </span>

module.exports = ItineraryDuration
