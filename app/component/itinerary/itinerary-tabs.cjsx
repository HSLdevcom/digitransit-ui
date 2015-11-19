React  = require 'react'
Tabs   = require 'react-simpletabs'

TransitLeg         = require './transit-leg'
WalkLeg            = require './walk-leg'
EndLeg             = require './end-leg'
TicketInformation  = require './ticket-information'
ItinerarySummary   = require './itinerary-summary'
Map                = require '../map/map'
ItineraryLine      = require '../map/itinerary-line'
TimeFrame = require './time-frame'

intl = require 'react-intl'

class ItineraryTabs extends React.Component
  @contextTypes:
    intl: intl.intlShape.isRequired

  render: ->
    legs = []
    numberOfLegs = @props.itinerary.legs.length
    @props.itinerary.legs.forEach (leg, j) ->
      if leg.transitLeg
        legs.push <TransitLeg key={j} index={j} leg={leg}/>
      else
        legs.push <WalkLeg key={j} index={j} leg={leg} legs={numberOfLegs}/>
    legs.push <EndLeg key={numberOfLegs}  index={numberOfLegs} endTime={@props.itinerary.endTime} to={@props.itinerary.legs[numberOfLegs - 1].to.name}/>

    leafletObj = <ItineraryLine key="line" legs={@props.itinerary.legs} showFromToMarkers={true} showTransferLabels={true}/>

    <div>
      <ItinerarySummary itinerary={@props.itinerary}>
        <TimeFrame startTime={@props.itinerary.startTime} endTime={@props.itinerary.endTime} className="timeframe--itinerary-summary"/>
      </ItinerarySummary>
      <Tabs className="itinerary-tabs">
        <Tabs.Panel
          title={@context.intl.formatMessage(
            {id: 'instructions', defaultMessage: "Instructions"})}
          className="fullscreen">
          <TicketInformation/>
          {legs}
        </Tabs.Panel>
        <Tabs.Panel
          title={@context.intl.formatMessage({
            id: 'map',
            defaultMessage: "Map"
          })}>
          <Map ref="map" className="fullscreen" leafletObjs={leafletObj} fitBounds={true} from={@props.itinerary.legs[0].from} to={@props.itinerary.legs[numberOfLegs - 1].to} padding={[0, 0]}/>
        </Tabs.Panel>
      </Tabs>
    </div>

module.exports = ItineraryTabs
