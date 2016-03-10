React              = require 'react'
TransitLeg         = require './transit-leg'
WalkLeg            = require './walk-leg'
WaitLeg            = require './wait-leg'
BicycleLeg         = require './bicycle-leg'
EndLeg             = require './end-leg'
AirportCheckInLeg  = require './airport-check-in-leg'
AirportCollectLuggageLeg  = require './airport-collect-luggage-leg'
StopCode                  = require './stop-code'

class ItineraryLegs extends React.Component

  stopCode: (stopCode) ->
    if stopCode
      <StopCode code={stopCode}/>
    else
      undefined

  render: =>
    numberOfLegs = @props.itinerary.legs.length

    legs = []
    @props.itinerary.legs.forEach (leg, j) =>
      focus = () => @props.focusMap(leg.from.lat, leg.from.lon)
      if leg.transitLeg
        legs.push <TransitLeg key={j} index={j} leg={leg} focusAction={focus}>
          {@stopCode leg.from.stopCode}
        </TransitLeg>
      else if leg.type == "CHECK-IN"
        legs.push <AirportCheckInLeg key={j} index={j} leg={leg} focusAction={focus}/>
      else if leg.type == "LUGGAGE-COLLECT"
        legs.push <AirportCollectLuggageLeg key={j} index={j} leg={leg} focusAction={focus}/>
      else if leg.mode == 'WAIT'
        legs.push <WaitLeg key={j} index={j} leg={leg} legs={numberOfLegs} focusAction={focus}>
          {@stopCode leg.from.stopCode}
        </WaitLeg>
      else if leg.rentedBike || leg.mode == 'BICYCLE' || leg.mode == 'CITYBIKE' || leg.mode == 'CITYBIKE_WALK'
        legs.push <BicycleLeg key={j} index={j} leg={leg} legs={numberOfLegs} focusAction={focus}/>
      else
        legs.push <WalkLeg
                    key={j}
                    index={j}
                    leg={leg}
                    legs={numberOfLegs}
                    walkToDestination={if parseInt(j) == numberOfLegs - 1 then true else false}
                    focusAction={focus}>
          {@stopCode leg.from.stopCode}
        </WalkLeg>

    legs.push <EndLeg
              key={numberOfLegs}
              index={numberOfLegs}
              endTime={@props.itinerary.endTime}
              focusAction={() => @props.focusMap(@props.itinerary.legs[numberOfLegs - 1].to.lat, @props.itinerary.legs[numberOfLegs - 1].to.lon)}
              to={@props.itinerary.legs[numberOfLegs - 1].to.name}/>
    <div>{legs}</div>


module.exports = ItineraryLegs
