React = require 'react'
Icon  = require '../icon/icon'
moment = require 'moment'

class ItinerarySummary extends React.Component

  render: ->
    <div className="itinerary-summary">
      <Icon img={'icon-icon_time'}/>
      <span className="itinerary-summary-duration">
        &nbsp;{Math.round(@props.itinerary.duration/60)}min&nbsp;
      </span>
      // {moment(@props.itinerary.startTime).format('HH:mm')} - {moment(@props.itinerary.endTime).format('HH:mm')} 
      &nbsp;&nbsp;<Icon img={'icon-icon_walk'}/>
      &nbsp;{Math.round(@props.itinerary.walkDistance/100)*100}m
    </div>

module.exports = ItinerarySummary