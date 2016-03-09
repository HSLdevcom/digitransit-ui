React        = require 'react'
RouteNumber  = require '../departure/route-number'
moment       = require 'moment'
Icon         = require '../icon/icon'
intl         = require 'react-intl'
Distance     = require './distance'
FormattedMessage = intl.FormattedMessage

class WalkLeg extends React.Component

  render: ->
    estimatedTime = moment.duration(@props.leg.duration, "seconds").humanize()

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
            <FormattedMessage
              id={if(@props.leg.from.name == @props.leg.to.name) then 'walk-from-to-same-dest' else 'walk-from-to'}
              values={{
                fromName: <b>{@props.leg.from.name}</b>
                toName: <b>{@props.leg.to.name}</b>
                estimatedTime: <b>{estimatedTime}</b>}}
              defaultMessage='Walk for {estimatedTime} from {fromName} to {toName}' />
              <Icon img={'icon-icon_search-plus'} className={'itinerary-search-icon'}/>
        </div>
        <div>
          <Distance distance={@props.leg.distance}/>
        </div>
      </div>
    </div>


module.exports = WalkLeg
