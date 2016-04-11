React        = require 'react'
moment       = require 'moment'
intl         = require 'react-intl'
RouteNumber  = require '../../departure/route-number'
Icon         = require '../../icon/icon'
Distance     = require '../distance'
FormattedMessage = intl.FormattedMessage
FormattedRelative = intl.FormattedRelative

class BicycleLeg extends React.Component

  render: ->
    mode = @props.leg.mode
    console.log @props
    if @props.leg.rentedBike == true
      if @props.leg.mode == 'BICYCLE'
        mode = 'CITYBIKE'
      if @props.leg.mode == 'WALK'
        mode = 'CITYBIKE_WALK'

    <div key={@props.index} style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={mode.toLowerCase()} vertical={true}/>
      </div>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column " + mode.toLowerCase()}>
        <div className="itinerary-leg-first-row">
          <FormattedMessage
            id='cycle-from-to'
            values={{
              fromName: <b>{@props.leg.from.name}</b>
              toName: <b>{@props.leg.to.name}</b>
              estimatedTime: <b>{moment.duration(@props.leg.duration, 'seconds').humanize()}</b>}}
            defaultMessage='Cycle for about {estimatedTime} from {fromName} to {toName}' />
          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div>
          <Distance distance={@props.leg.distance}/>
        </div>
      </div>
    </div>


module.exports = BicycleLeg
