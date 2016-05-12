React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
DefaultNavigation  = require '../navigation/default-navigation'
BottomNavigation   = require '../itinerary/bottom-navigation'
ItineraryTab       = require '../itinerary/itinerary-tab'
intl               = require 'react-intl'
SwipeableViews     = require('react-swipeable-views').default
ItineraryLine      = require '../map/itinerary-line'
Icon               = require '../icon/icon'
{getRoutePath}     = require '../../util/path'
{locationToOTP}    = require '../../util/otp-strings'
Tabs               = require('material-ui/Tabs/Tabs').default
Tab                = require('material-ui/Tabs/Tab').default
ItinerarySummary      = require '../itinerary/itinerary-summary'
Map                   = require '../map/map'
ItineraryLine         = require '../map/itinerary-line'
Icon                  = require '../icon/icon'
{supportsHistory}     = require 'history/lib/DOMUtils'
sortBy                = require 'lodash/sortBy'
moment                = require 'moment'
config                = require '../../config'

class ItineraryPlanContainer extends React.Component

  @contextTypes:
    router: React.PropTypes.object.isRequired

  constructor: ->
    super
    @state =
      lat: undefined
      lon: undefined
      fullscreen: false

  focusMap: (lat, lon) =>
    @setState
      lat: lat
      lon: lon

  toggleFullscreenMap: =>
    @setState ("fullscreen": !@state.fullscreen)

  switchSlide: (index) =>
    @context.router.replace getRoutePath(@props.fromPlace, @props.toPlace) + "/" + index
    itineraryTab = @refs["itineraryTab" + index]
    if itineraryTab and itineraryTab.state
      @focusMap(itineraryTab.state.lat, itineraryTab.state.lon)

  getSlides: (itineraries) =>
    slides = []
    for itinerary, i in itineraries
      slides.push <div className={"itinerary-slide-container"} key={i}>
                    <ItineraryTab
                    ref={"itineraryTab" + i}
                    focus={@focusMap}
                    itinerary={itinerary}
                    index={i}/>
                  </div>
    slides

  getTabs: (itineraries, selectedIndex) =>
    tabs = []
    for itinerary, i in itineraries
      color = if i == selectedIndex then "#007ac9" else "#ddd"
      tabs.push <Tab
                  selected={if i == selectedIndex then true else false}
                  key={i}
                  label="•"
                  value={i}
                  className={if i == selectedIndex then "itinerary-tab-root--selected" else "itinerary-tab-root"}
                  style={{height: "18px", color: color, fontSize: "34px", padding: "0px"}} />
    tabs

  render: =>
    plan = @props.plan.plan
    unless plan
      return <div></div>
    itineraries = plan.itineraries

    leafletObjs = [
      <ItineraryLine key={"line" + @props.hash} legs={itineraries[parseInt(@props.hash)].legs} showFromToMarkers={true} showTransferLabels={true}/>]

    if @state.fullscreen
      content =
        <div style={"height": "100%"} onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <Map
            ref="map2"
            className="fullscreen"
            leafletObjs={leafletObjs}
            lat={if @state.lat then @state.lat else itineraries[parseInt(@props.hash)].legs[0].from.lat}
            lon={if @state.lon then @state.lon else itineraries[parseInt(@props.hash)].legs[0].from.lon}
            zoom=16
            fitBounds={false}>
            <div className="fullscreen-toggle" onClick={@toggleFullscreenMap}>
              <Icon img={'icon-icon_maximize'} className="cursor-pointer" />
            </div>
          </Map>
        </div>

    else
      content =
        <div style={height: "100%"}>
          <div onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
            <Map
              ref="map"
              leafletObjs={leafletObjs}
              lat={if @state.lat then @state.lat else itineraries[parseInt(@props.hash)].legs[0].from.lat}
              lon={if @state.lon then @state.lon else itineraries[parseInt(@props.hash)].legs[0].from.lon}
              zoom=16
              fitBounds={false}
              leafletOptions={dragging: false, touchZoom: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false}>
              <div className="map-click-prevent-overlay" onClick={@toggleFullscreenMap}/>
              <div className="fullscreen-toggle" onClick={@toggleFullscreenMap}>
                <Icon img={'icon-icon_maximize'} className="cursor-pointer" />
              </div>
            </Map>
          </div>
          <SwipeableViews
            index={parseInt(@props.hash)}
            className="itinerary-swipe-views-root"
            slideStyle={{height: "100%"}}
            containerStyle={{height: "100%"}}
            onChangeIndex={(index) => setTimeout @switchSlide, 150, index}>
            {@getSlides(itineraries)}
          </SwipeableViews>
          <div className="itinerary-tabs-container">
            <Tabs
              onChange={@switchSlide}
              value={parseInt(@props.hash)}
              tabItemContainerStyle={{backgroundColor: "#eef1f3", lineHeight: "18px", width: "60px", marginLeft: "auto", marginRight: "auto"}}
              inkBarStyle={{display: "none"}}
            >
              {@getTabs(itineraries, parseInt(@props.hash))}
            </Tabs>
          </div>
        </div>

module.exports = Relay.createContainer ItineraryPlanContainer,
  fragments: queries.ItineraryPlanContainerFragments
  initialVariables:
    from: null
    to: null
    fromPlace: null
    toPlace: null
    numItineraries: 3
    modes: "BUS,TRAM,RAIL,SUBWAY,FERRY,WALK"
    date: moment().format("YYYY-MM-DD")
    time: moment().format("HH:mm:ss")
    walkReluctance: 2.0001
    walkBoardCost: 600
    minTransferTime: 180
    walkSpeed: 1.2
    wheelchair: false
    maxWalkDistance: config.maxWalkDistance + 0.1
    preferred:
      agencies: config.preferredAgency or ""
    arriveBy: true
    disableRemainingWeightHeuristic: false
