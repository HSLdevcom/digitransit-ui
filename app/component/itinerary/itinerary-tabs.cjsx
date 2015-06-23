React  = require 'react'
Tabs   = require 'react-simpletabs'

TransitLeg         = require './transit-leg'
WalkLeg            = require './walk-leg'
EndLeg             = require './end-leg'
TicketInformation  = require './ticket-information'
ItinerarySummary   = require './itinerary-summary'
Map                = require '../map/map'
ItineraryLine      = require '../map/itinerary-line'

class ItineraryTabs extends React.Component
  render: ->
    legs = []
    numberOfLegs = @props.itinerary.legs.length
    @props.itinerary.legs.forEach (leg, j) ->
      if leg.transitLeg
        legs.push <TransitLeg key={j} index={j} leg={leg}/>
      else
        legs.push <WalkLeg key={j}  index={j} leg={leg} legs={numberOfLegs}/>
    legs.push <EndLeg key={numberOfLegs}  index={numberOfLegs} endTime={@props.itinerary.endTime} to={@props.itinerary.legs[numberOfLegs-1].to.name}/>

    leafletObj = <ItineraryLine key="line" legs={@props.itinerary.legs} showFromToMarkers={true} showTransferLabels={true}/>

    <div>
      <ItinerarySummary itinerary={@props.itinerary}/>
      <Tabs className="itinerary-tabs">
        <Tabs.Panel title="Ohjeet" className="fullscreen">
          <TicketInformation/>
          {legs}
        </Tabs.Panel>
        <Tabs.Panel title="Kartta">
          <Map ref="map" className="fullscreen" leafletObjs={leafletObj} fitBounds={true} from={@props.itinerary.legs[0].from} to={@props.itinerary.legs[numberOfLegs-1].to} padding={[0, 0]}/>
        </Tabs.Panel>
      </Tabs>
    </div>

module.exports = ItineraryTabs