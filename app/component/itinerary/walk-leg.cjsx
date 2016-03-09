React        = require 'react'
RouteNumber  = require '../departure/route-number'
moment       = require 'moment'
Icon         = require '../icon/icon'
intl         = require 'react-intl'
Distance     = require './distance'
FormattedMessage = intl.FormattedMessage
geoUtils         = require '../../util/geo-utils'
timeUtils    = require '../../util/time-utils'

class WalkLeg extends React.Component

  render: ->
    distance = geoUtils.displayDistance parseInt(@props.leg.distance)
    duration = timeUtils.durationToString(@props.leg.duration * 1000)

    <div key={@props.index} style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={@props.leg.mode.toLowerCase()} vertical={true}/>
      </div>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column " + @props.leg.mode.toLowerCase()}>
        <div className="itinerary-leg-first-row">
            <div>{@props.leg.from.name}</div>
            <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div className="itinerary-leg-distance">
          <div>
            <FormattedMessage
              id={'walk-distance-to-' + if @props.walkToDestination then 'dest' else 'stop'}
              values={{
                distance: distance
                duration: "(" + duration + ")"}}
              defaultMessage={'Walk {distance} ({duration}) to ' + if @props.walkToDestination then 'destination' else 'stop'} />
          </div>
        </div>
      </div>
    </div>


module.exports = WalkLeg
