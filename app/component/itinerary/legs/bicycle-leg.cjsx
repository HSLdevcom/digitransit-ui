React        = require 'react'
moment       = require 'moment'
intl         = require 'react-intl'
RouteNumber  = require '../../departure/route-number'
Icon         = require '../../icon/icon'
Distance     = require('../Distance').default
FormattedMessage  = intl.FormattedMessage
FormattedRelative = intl.FormattedRelative
geoUtils     = require '../../../util/geo-utils'
timeUtils    = require '../../../util/time-utils'

class BicycleLeg extends React.Component

  render: ->
    distance = geoUtils.displayDistance parseInt(@props.leg.distance)
    duration = timeUtils.durationToString(@props.leg.duration * 1000)

    mode = @props.leg.mode

    legDescription = <span>{@props.leg.from.name}</span>

    if @props.leg.mode == 'WALK' or @props.leg.mode == 'BICYCLE_WALK'
      stopsDescription = <FormattedMessage
        id='cyclewalk-distance-duration'
        values={{
          distance: distance
          duration: duration
        }}
        defaultMessage='Walk the bike {distance} ({duration})' />
    else
      stopsDescription = <FormattedMessage
        id='cycle-distance-duration'
        values={{
          distance: distance
          duration: duration
        }}
        defaultMessage='Cycle {distance} ({duration})' />

    if @props.leg.rentedBike == true
      legDescription = <FormattedMessage id='rent-cycle-at'
        values={{
          station: @props.leg.from.name
        }}
        defaultMessage='Rent cycle at {station}'
      />

      if @props.leg.mode == 'BICYCLE'
        mode = 'CITYBIKE'
      if @props.leg.mode == 'WALK'
        mode = 'CITYBIKE_WALK'

    <div key={@props.index} style={{width: "100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <RouteNumber mode={mode} vertical={true}/>
      </div>
      <div onClick={@props.focusAction} className={"small-10 columns itinerary-instruction-column " + mode.toLowerCase()}>
        <div className="itinerary-leg-first-row">
          {legDescription}
          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div className='itinerary-leg-intermediate-stops'>
          {stopsDescription}
        </div>
      </div>
    </div>


module.exports = BicycleLeg
