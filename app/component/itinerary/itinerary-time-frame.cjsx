React = require 'react'
moment = require 'moment'

ItineraryTimeFrame = (props) ->

  ItineraryTimeFrame.description =
    "Displays the time frame of interval (example: // 15:55 - 16:15)"

  ItineraryTimeFrame.propTypes =
    itinerary: React.PropTypes.object.isRequired

  <span>
  // {moment(props.itinerary.startTime).format('HH:mm')} - {moment(props.itinerary.endTime).format('HH:mm')}
  </span>

module.exports = ItineraryTimeFrame
