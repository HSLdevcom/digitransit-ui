React       = require 'react'
TransitLeg  = require './transit-leg'
WalkLeg     = require './walk-leg'
WaitLeg     = require './wait-leg'
BicycleLeg  = require './bicycle-leg'
EndLeg      = require './end-leg'
AirportCheckInLeg        = require './airport-check-in-leg'
AirportCollectLuggageLeg = require './airport-collect-luggage-leg'
StopCode    = require '../stop-code'
BusLeg      = require './bus-leg'
AirplaneLeg = require './airplane-leg'
SubwayLeg   = require './subway-leg'
TramLeg     = require './tram-leg'
RailLeg     = require './rail-leg'
FerryLeg    = require './ferry-leg'
CarLeg      = require './car-leg'
config      = require '../../../config'


class ItineraryLegs extends React.Component

  stopCode: (stopCode) ->
    if stopCode
      <StopCode code={stopCode}/>
    else
      undefined

  continueWithBicycle: (leg1, leg2) =>
    (leg1?.mode == 'BICYCLE' or leg1?.mode == 'WALK') and
    (leg2?.mode == 'BICYCLE' or leg2?.mode == 'WALK')

  continueWithRentedBicycle: (leg1, leg2) =>
    leg1?.rentedBike and leg2?.rentedBike

  compressNextPossibleLegs: (leg, legs, pred) =>
    for nextLeg in legs
      if pred
        leg.duration += nextLeg.duration
        leg.distance += nextLeg.distance
        leg.to = nextLeg.to
        leg.endTime = nextLeg.endTime
      else
        break

  render: =>
    waitThreshold = config.itinerary.waitThreshold * 1000

    legs = []
    usingOwnBicycle = @props.itinerary.legs[0]?.mode == 'BICYCLE' and not @props.itinerary.legs[0]?.rentedBike

    originalLegs = @props.itinerary.legs
    compressedLegs = []
    compressLeg = false

    for cleg in originalLegs
      if compressLeg
        if usingOwnBicycle and @continueWithBicycle(compressLeg, cleg)
          compressLeg.duration += cleg.duration
          compressLeg.distance += cleg.distance
          compressLeg.to = cleg.to
          compressLeg.endTime = cleg.endTime
          compressLeg.mode = 'BICYCLE'
        else if cleg.rentedBike and @continueWithRentedBicycle(compressLeg, cleg)
          compressLeg.duration += cleg.duration
          compressLeg.distance += cleg.distance
          compressLeg.to = cleg.to
          compressLeg.endTime += cleg.endTime
          compressLeg.mode = 'CITYBIKE'
        else
          if usingOwnBicycle and compressLeg.mode == 'WALK'
            compressLeg.mode = 'BICYCLE_WALK'
          compressedLegs.push compressLeg
          compressLeg = cleg
      else
        compressLeg = cleg

    if compressLeg
      compressedLegs.push compressLeg

    numberOfLegs = compressedLegs.length
    focus = (leg) => ()  => @props.focusMap(leg.from.lat, leg.from.lon)

    for leg, j in compressedLegs
      nextLeg = compressedLegs[j + 1] if j + 1 < compressedLegs.length
      previousLeg = compressedLegs[j - 1] if j > 0
      if leg.mode == 'BUS'
        legs.push <BusLeg key={j} index={j} leg={leg} focusAction={focus leg} />
      else if leg.mode == 'TRAM'
        legs.push <TramLeg key={j} index={j} leg={leg} focusAction={focus leg} />
      else if leg.mode == 'FERRY'
        legs.push <FerryLeg key={j} index={j} leg={leg} focusAction={focus leg} />
      else if leg.mode == 'RAIL'
        legs.push <RailLeg key={j} index={j} leg={leg} focusAction={focus leg} />
      else if leg.mode == 'SUBWAY'
        legs.push <SubwayLeg key={j} index={j} leg={leg} focusAction={focus leg} />
      else if leg.mode == 'AIRPLANE'
        startTime = previousLeg?.endTime or leg.startTime
        legs.push <AirportCheckInLeg key={j + 'ci'} leg={leg} startTime={startTime} focusAction={focus leg}/>
        legs.push <AirplaneLeg key={j} index={j} leg={leg} focusAction={focus leg} />
        legs.push <AirportCollectLuggageLeg key={j + 'cl'} leg={leg} focusAction={focus leg}/>
      else if leg.rentedBike or leg.mode == 'BICYCLE' or leg.mode == 'BICYCLE_WALK'
        legs.push <BicycleLeg key={j} index={j} leg={leg} focusAction={focus leg}/>
      else if leg.mode == 'CAR'
        legs.push <CarLeg
          key={j}
          index={j}
          leg={leg}
          focusAction={focus leg}>
          {@stopCode leg.from.stop?.code}
        </CarLeg>
      else
        legs.push <WalkLeg
          key={j}
          index={j}
          leg={leg}
          focusAction={focus leg}>
          {@stopCode leg.from.stop?.code}
        </WalkLeg>

      waitTime = nextLeg.startTime - leg.endTime if nextLeg
      if waitTime > waitThreshold and nextLeg?.mode != 'AIRPLANE' and leg.mode != 'AIRPLANE'
        legs.push <WaitLeg key={j + 'w'} leg={leg} startTime={leg.endTime} waitTime={waitTime} focusAction={focus leg}>
          {@stopCode leg.from.stop?.code}
        </WaitLeg>

    legs.push <EndLeg
              key={numberOfLegs}
              index={numberOfLegs}
              endTime={@props.itinerary.endTime}
              focusAction={() => @props.focusMap(compressedLegs[numberOfLegs - 1].to.lat, compressedLegs[numberOfLegs - 1].to.lon)}
              to={compressedLegs[numberOfLegs - 1].to.name}/>
    <div>{legs}</div>


module.exports = ItineraryLegs
