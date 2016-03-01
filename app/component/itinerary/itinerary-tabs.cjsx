React              = require 'react'
Tabs               = require 'react-simpletabs'
TransitLeg         = require './transit-leg'
WalkLeg            = require './walk-leg'
WaitLeg            = require './wait-leg'
EndLeg             = require './end-leg'
TicketInformation  = require './ticket-information'
RouteInformation   = require './route-information'
ItinerarySummary   = require './itinerary-summary'
Map                = require '../map/map'
ItineraryLine      = require '../map/itinerary-line'
TimeFrame          = require './time-frame'
config             = require '../../config'
intl               = require 'react-intl'
Icon               = require '../icon/icon'
cx                 = require 'classnames'
ItineraryLegs      = require './itinerary-legs'

ticketInformation = if config.showTicketInformation then <TicketInformation/> else null

ItineraryTabs = React.createClass
  contextTypes:
    intl: intl.intlShape.isRequired

  getInitialState: ->
    "fullscreen": false
    "lat": @props.itinerary.legs[0].from.lat
    "lon": @props.itinerary.legs[0].from.lon

  toggleFullscreenMap: ->
    @setState ("fullscreen": !@state.fullscreen)

  focusMap: (lat, lon) ->
    @setState
      "lat": lat
      "lon": lon

  unFocus: ->
    @setState
      lat: undefined
      lon: undefined

  render: ->
    numberOfLegs = @props.itinerary.legs.length
    leafletObj = <ItineraryLine key="line" legs={@props.itinerary.legs} showFromToMarkers={true} showTransferLabels={true}/>

    if @state.fullscreen == true
      <div style={"height": "100%"}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        >
        <Map
          className="fullscreen"
          ref="map2"
          leafletObjs={leafletObj}
          lat={@state.lat}
          lon={@state.lon}
          zoom="16"
          fitBounds={false}
          from={@props.itinerary.legs[0].from}
          to={@props.itinerary.legs[numberOfLegs - 1].to}
          leafletEvents={if @state.lat then onLeafletDragstart: @unFocus, onLeafletZoomend: @unFocus}
          >
            <div className="fullscreen-toggle" onClick={@toggleFullscreenMap}>
              <Icon img={'icon-icon_maximize'} className="cursor-pointer" />
            </div>
        </Map>
      </div>

    else
      <div>
          <div
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Map
              ref="map"
              leafletObjs={leafletObj}
              lat={@state.lat}
              lon={@state.lon}
              zoom="16"
              fitBounds={false}
              from={@props.itinerary.legs[0].from}
              to={@props.itinerary.legs[numberOfLegs - 1].to}
              leafletEvents={if @state.lat then onLeafletDragstart: @unFocus, onLeafletZoomend: @unFocus}>
              <div className="fullscreen-toggle" onClick={@toggleFullscreenMap}>
                <Icon img={'icon-icon_maximize'} className="cursor-pointer" />
              </div>
            </Map>
          </div>
        <Tabs className="itinerary-tabs">
          <Tabs.Panel className="fullscreen">
            <ItinerarySummary itinerary={@props.itinerary}>
              <TimeFrame startTime={@props.itinerary.startTime} endTime={@props.itinerary.endTime} className="timeframe--itinerary-summary"/>
            </ItinerarySummary>
            <div className="momentum-scroll itinerary-tabs__scroll">
              <div className="itinerary-main">
                <ItineraryLegs itinerary={@props.itinerary} focusMap={@focusMap}/>
                <RouteInformation/>
                {ticketInformation}
              </div>
            </div>
          </Tabs.Panel>
          <Tabs.Panel>
          </Tabs.Panel>
        </Tabs>
      </div>

module.exports = ItineraryTabs
