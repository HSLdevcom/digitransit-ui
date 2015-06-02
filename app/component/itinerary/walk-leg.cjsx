React = require 'react'
Icon  = require '../icon/icon'
moment = require 'moment'

class WalkLeg extends React.Component

  render: ->
    <div key={@props.index} style={{width:"100%"}} className="row itinerary-row">
      <div className="small-2 columns itinerary-time-column">
        <div className="itinerary-time-column-time">
          {moment(@props.leg.startTime).format('HH:mm')}
        </div>
        <Icon className={@props.leg.mode.toLowerCase()} img={'icon-icon_' + @props.leg.mode.toLowerCase() }/>
      </div>
      <div className={"small-1 columns itinerary-line-column " + @props.leg.mode.toLowerCase() + if @props.index == 0 then " from" else ""}>
        •
      </div>
      <div className="small-9 columns itinerary-instruction-column">
        {if @props.index == 0 then <div>Aloita matka paikasta</div> else false}
        <div>{@props.leg.from.name}</div>
        <div>{if @props.legs == @props.index+1 then "Kävele määränpäähän" else "Kävele pysäkille"}</div>
        <div>{@props.leg.to.name}</div>
        <div>{Math.round(@props.leg.distance)} m ({Math.round(@props.leg.duration/60)} minuuttia)</div>
      </div>
    </div>

module.exports = WalkLeg