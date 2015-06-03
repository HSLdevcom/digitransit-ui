React = require 'react'
Icon  = require '../icon/icon'
moment = require 'moment'

class EndLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width:"100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.endTime).format('HH:mm')}
        </div>
      </div>
      <div className="small-10 columns itinerary-instruction-column to">
        <div>Lopeta matka paikassa</div>
        <div>{@props.to}</div>
      </div>
    </div>

module.exports = EndLeg