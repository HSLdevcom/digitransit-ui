React        = require 'react'
RouteNumber  = require '../../departure/route-number'
moment       = require 'moment'
Icon         = require '../../icon/icon'
intl         = require 'react-intl'
Distance     = require('../Distance').default
FormattedMessage = intl.FormattedMessage
geoUtils         = require '../../../util/geo-utils'
timeUtils    = require '../../../util/time-utils'

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
          {if @props.index == 0
            <div><Icon img={'icon-icon_mapMarker-point'} className="itinerary-icon from"/></div>
          }
          <div>
            {@props.leg.from.name}
            {@props.children}
            {if @props.leg.from.stop?.code then <Icon img={'icon-icon_arrow-collapse--right'} className={'itinerary-leg-first-row__arrow'}/>}
          </div>
          <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div className="itinerary-leg-action">
          <FormattedMessage
            id={'walk-distance-duration'}
            values={{
              distance: distance
              duration: duration}}
            defaultMessage={"Walk {distance} ({duration})"} />
        </div>
      </div>
    </div>


module.exports = WalkLeg
