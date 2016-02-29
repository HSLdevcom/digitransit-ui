React              = require 'react'
TransitLeg         = require './transit-leg'
WalkLeg            = require './walk-leg'
WaitLeg            = require './wait-leg'
EndLeg             = require './end-leg'

ItineraryLegs = React.createClass
  render: ->
    numberOfLegs = @props.itinerary.legs.length

    legs = []
    @props.itinerary.legs.forEach (leg, j) =>
      focus = () => @focusMap(leg.from.lat, leg.from.lon)
      if leg.transitLeg
        legs.push <TransitLeg key={j} index={j} leg={leg} focusAction={focus}/>
      else if leg.mode == 'WAIT'
        legs.push <WaitLeg key={j} index={j} leg={leg} legs={numberOfLegs} focusAction={focus}/>
      else
        legs.push <WalkLeg key={j} index={j} leg={leg} legs={numberOfLegs} focusAction={focus}/>

    legs.push <EndLeg
                key={numberOfLegs}
                index={numberOfLegs}
                endTime={@props.itinerary.endTime}
                to={@props.itinerary.legs[numberOfLegs - 1].to.name}
                focusAction={() => @props.focusMap(@props.itinerary.legs[numberOfLegs - 1].to.lat, @props.itinerary.legs[numberOfLegs - 1].to.lon)}/>

    <div>{legs}</div>


module.exports = ItineraryLegs
