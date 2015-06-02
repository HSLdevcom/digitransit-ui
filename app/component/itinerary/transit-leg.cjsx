React = require 'react'
Icon  = require '../icon/icon'
moment = require 'moment'


class TransitLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width:"100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <Icon className={@props.leg.mode.toLowerCase()} img={'icon-icon_' + @props.leg.mode.toLowerCase() }/>
        <div className={"ilinerary-time-column-route " + @props.leg.mode.toLowerCase()}>
          {@props.leg.routeShortName}
        </div>
      </div>
      <div className={"small-1 columns itinerary-line-column " + @props.leg.mode.toLowerCase() + if @props.index == 0 then " from" else ""}>
        •
      </div>
      <div className="small-9 columns itinerary-instruction-column">
        {if @props.index == 0 then <div>Aloita matka pysäkiltä</div> else false}
        <div>{@props.leg.from.name}</div>
        <div>{if @props.leg.headsign then "Linja #{@props.leg.route} suuntaan #{@props.leg.headsign}" else "Linja #{@props.leg.route}"}</div>
        <div>{@props.leg.intermediateStops.length + 1} pysäkkiä ({Math.round(@props.leg.duration/60)} minuuttia)</div>
        <div>Nouse kyydistä pysäkillä</div>
        <div>{@props.leg.to.name}</div>
      </div>
    </div>

module.exports = TransitLeg