React = require 'react'
RouteNumber  = require '../departure/route-number'
moment = require 'moment'

intl = require 'react-intl'
FormattedMessage = intl.FormattedMessage

class WalkLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width:"100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={@props.leg.mode.toLowerCase()} vertical={true}/>
      </div>
      <div className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase() + if @props.index == 0 then " from" else ""}>
        {if @props.index == 0
          <div>
            <FormattedMessage id="start-journey-place"
                              defaultMessage='Start journey from' />
          </div>
        else
          false }
        <div>{@props.leg.from.name}</div>
        <div>{if @props.legs == @props.index+1
          <FormattedMessage
            id="walk-to-destination"
            defaultMessage='Walk to destination' />
        else
          <FormattedMessage
            id="walk-to-stop"
            defaultMessage='Walk to stop' /> }
        </div>
        <div>{@props.leg.to.name}</div>
        <div>{Math.round(@props.leg.distance)} m ({Math.round(@props.leg.duration / 60)} <FormattedMessage id='minutes' defaultMessage='minutes' />)</div>
      </div>
    </div>

module.exports = WalkLeg
