React              = require 'react'
TransitLeg         = require './legs/transit-leg'
WalkLeg            = require './legs/walk-leg'
WaitLeg            = require './legs/wait-leg'
EndLeg             = require './legs/end-leg'
TicketInformation  = require './ticket-information'
RouteInformation   = require './route-information'
ItinerarySummary   = require './itinerary-summary'
TimeFrame          = require './time-frame'
config             = require '../../config'
ItineraryLegs      = require './legs/itinerary-legs'


ticketInformation = if config.showTicketInformation then <TicketInformation/> else null
routeInformation = if config.showRouteInformation then <RouteInformation/> else null

class ItineraryTab extends React.Component

  constructor: ->
    super
    @state =
      fullscreen: false
      lat: undefined
      lon: undefined

  shouldComponentUpdate: (nextProps, nextState) =>
    #This is a static component (for now), so we do not need to update it:
    false

  getState: =>
    lat: @state.lat
    lon: @state.lon

  handleFocus: (lat, lon) =>
    @props.focus(lat, lon)
    #set internal state:
    @setState
      lat: lat
      lon: lon

  render: ->
    <div className="fullscreen">
      <ItinerarySummary itinerary={@props.itinerary}>
        <TimeFrame startTime={@props.itinerary.startTime} endTime={@props.itinerary.endTime} className="timeframe--itinerary-summary"/>
      </ItinerarySummary>
      <div className="momentum-scroll itinerary-tabs__scroll">
        <div className="itinerary-main">
          <ItineraryLegs itinerary={@props.itinerary} focusMap={@handleFocus}/>
          {routeInformation}
          {ticketInformation}
        </div>
      </div>
    </div>

module.exports = ItineraryTab
