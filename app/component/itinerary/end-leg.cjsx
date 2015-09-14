React = require 'react'
Icon  = require '../icon/icon'
moment = require 'moment'

intl = require('react-intl')
FormattedMessage = intl.FormattedMessage

class EndLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width:"100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.endTime).format('HH:mm')}
        </div>
      </div>
      <div className="small-10 columns itinerary-instruction-column to">
        <div><FormattedMessage id='end-journey'
                               defaultMessage='End journey at' /></div>
        <div>{@props.to}</div>
      </div>
    </div>

module.exports = EndLeg
