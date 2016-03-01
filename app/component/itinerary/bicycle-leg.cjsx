React        = require 'react'
moment       = require 'moment'
intl         = require 'react-intl'
RouteNumber  = require '../departure/route-number'

FormattedMessage = intl.FormattedMessage
FormattedRelative = intl.FormattedRelative

class BicycleLeg extends React.Component

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
            id='cycle-from-to'
            values={{
              fromName: <b>{@props.leg.from.name}</b>
              toName: <b>{@props.leg.to.name}</b>
              estimatedTime: <b>{moment.duration(@props.leg.duration, 'seconds').humanize()}</b>}}
            defaultMessage='Cycle for about {estimatedTime} from {fromName} to {toName}' />
        </div>
      </div>
    </div>

module.exports = BicycleLeg
