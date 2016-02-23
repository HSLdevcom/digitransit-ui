React = require 'react'
RouteNumber  = require '../departure/route-number'
moment = require 'moment'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class WaitLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={@props.leg.mode.toLowerCase()} vertical={true}/>
      </div>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase()}>
        <div>
            <FormattedMessage
              id='wait-message'
              values={{
                  stopPlace: @props.leg.to.name
                  estimatedMinutes: Math.round(@props.leg.duration / 60)}}
              defaultMessage='Wait for {estimatedMinutes} minutes at {stopPlace}' />
        </div>
      </div>
    </div>

module.exports = WaitLeg
