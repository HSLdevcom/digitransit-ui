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

  focusMap: (leg) ->
    @setState (
      "lat": leg.from.lat
      "lon": leg.from.lon
    )

  render: ->
    numberOfLegs = @props.itinerary.legs.length
    leafletObj = <ItineraryLine key="line" legs={@props.itinerary.legs} showFromToMarkers={true} showTransferLabels={true}/>
    if @state.fullscreen == true
      <div style={"height": "100%"}
        onTouchStart={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        >
        <Map className="fullscreen" ref="map2" leafletObjs={leafletObj} lat={@state.lat} lon={@state.lon} zoom="16" fitBounds={false} from={@props.itinerary.legs[0].from} to={@props.itinerary.legs[numberOfLegs - 1].to}>
            <div className="fullscreen-toggle" onClick={@toggleFullscreenMap}>
              <Icon img={'icon-icon_maximize'} className="cursor-pointer" />
            </div>
        </Map>
      </div>

    else
      legs = []
      @props.itinerary.legs.forEach (leg, j) =>
        focus = () => @focusMap(leg)
        if leg.transitLeg
          legs.push <TransitLeg key={j} index={j} leg={leg} focusAction={focus}/>
        else if leg.mode == 'WAIT'
          legs.push <WaitLeg key={j} index={j} leg={leg} legs={numberOfLegs} focusAction={focus}/>
        else
          legs.push <WalkLeg key={j} index={j} leg={leg} legs={numberOfLegs} focusAction={focus}/>
      legs.push <EndLeg key={numberOfLegs}  index={numberOfLegs} endTime={@props.itinerary.endTime} to={@props.itinerary.legs[numberOfLegs - 1].to.name}/>


      <div>
          <div
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            >
            <Map ref="map" leafletObjs={leafletObj} lat={@state.lat} lon={@state.lon} zoom="16" fitBounds={false} from={@props.itinerary.legs[0].from} to={@props.itinerary.legs[numberOfLegs - 1].to}>
              <div className="fullscreen-toggle" onClick={@toggleFullscreenMap}>
                <Icon img={'icon-icon_maximize'} className="cursor-pointer" />
              </div>
            </Map>
          </div>
        <Tabs className="itinerary-tabs">
          <Tabs.Panel className="fullscreen">
            <div className="momentum-scroll">
              <ItinerarySummary itinerary={@props.itinerary}>
                <TimeFrame startTime={@props.itinerary.startTime} endTime={@props.itinerary.endTime} className="timeframe--itinerary-summary"/>
              </ItinerarySummary>
              <div className="itinerary-main">
                {legs}
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
