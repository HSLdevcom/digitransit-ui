React = require 'react'
intl = require 'react-intl'
moment = require 'moment'
RouteNumber = require '../departure/route-number'

FormattedMessage = intl.FormattedMessage

class AirportCheckInLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={@props.leg.mode.toLowerCase()} vertical={true}/>
      </div>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase()}>
        <div><FormattedMessage
            id='airport-check-in'
            values={{
              agency: @props.leg.nextLeg.agencyName}}
            defaultMessage='Optionally check in your luggage with {agency}' />
        </div>
        <div><FormattedMessage
            id='airport-security-check-go-to-gate'
            defaultMessage='Walk through the security check and go to gate' />
        </div>
      </div>
    </div>


module.exports = AirportCheckInLeg
