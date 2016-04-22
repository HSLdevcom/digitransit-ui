React              = require 'react'
Helmet             = require 'react-helmet'
DefaultNavigation  = require '../component/navigation/default-navigation'
BottomNavigation   = require '../component/itinerary/bottom-navigation'
ItineraryTab       = require '../component/itinerary/itinerary-tab'
intl               = require 'react-intl'
SwipeableViews     = require('react-swipeable-views').default
ItineraryLine      = require '../component/map/itinerary-line'
Icon               = require '../component/icon/icon'
Map                = require '../component/map/map'
{getRoutePath}     = require '../util/path'
{locationToOTP}    = require '../util/otp-strings'
Tabs               = require('material-ui/Tabs/Tabs').default
Tab                = require('material-ui/Tabs/Tab').default

class ItineraryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
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
    geolocation = @context.getStore('PositionStore').getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()
    destination = @context.getStore('EndpointStore').getDestination()

    if ((origin.lat or origin.useCurrentPosition and geolocation.hasLocation) and
        (destination.lat or destination.useCurrentPosition and geolocation.hasLocation))
      geo_string = locationToOTP(
        Object.assign({address: "Oma sijainti"}, geolocation))

      if origin.useCurrentPosition
        from = geo_string
      else
        from = locationToOTP(origin)

      if destination.useCurrentPosition
        to = geo_string
      else
        to = locationToOTP(destination)
      setTimeout(() =>
        @context.router.replace getRoutePath(from, to) + "/" + index
        itineraryTabState = @refs["itineraryTab" + index].getState()
        @focusMap(itineraryTabState.lat, itineraryTabState.lon)
      , 100)

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
    plan = @context.getStore('ItinerarySearchStore').getData().plan
    unless plan
      return <DefaultNavigation className="fullscreen"/>
    itineraries = plan.itineraries

    leafletObj = <ItineraryLine key={"line" + @props.params.hash} legs={itineraries[parseInt(@props.params.hash)].legs} showFromToMarkers={true} showTransferLabels={true}/>

    meta =
      title: @context.intl.formatMessage {id: 'itinerary-page.title', defaultMessage: "Route"}
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'itinerary-page.description', defaultMessage: "Route"}}
      ]

    if @state.fullscreen
      content =
        <div style={"height": "100%"} onTouchStart={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
          <Map
            ref="map2"
            className="fullscreen"
            leafletObjs={leafletObj}
            lat={if @state.lat then @state.lat else itineraries[parseInt(@props.params.hash)].legs[0].from.lat}
            lon={if @state.lon then @state.lon else itineraries[parseInt(@props.params.hash)].legs[0].from.lon}
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
              leafletObjs={leafletObj}
              lat={if @state.lat then @state.lat else itineraries[parseInt(@props.params.hash)].legs[0].from.lat}
              lon={if @state.lon then @state.lon else itineraries[parseInt(@props.params.hash)].legs[0].from.lon}
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
            index={parseInt(@props.params.hash)}
            className="itinerary-swipe-views-root"
            slideStyle={{height: "100%"}}
            containerStyle={{height: "100%"}}
            onChangeIndex={@switchSlide}>
            {@getSlides(itineraries)}
          </SwipeableViews>
          <div className="itinerary-tabs-container">
            <Tabs
              onChange={@switchSlide}
              value={parseInt(@props.params.hash)}
              tabItemContainerStyle={{backgroundColor: "#eef1f3", lineHeight: "18px", width: "60px", marginLeft: "auto", marginRight: "auto"}}
              inkBarStyle={{display: "none"}}
            >
              {@getTabs(itineraries, parseInt(@props.params.hash))}
            </Tabs>
          </div>
        </div>


    <DefaultNavigation className="fullscreen">
      <Helmet {...meta} />
        {content}
      <BottomNavigation params={@props.params}/>
    </DefaultNavigation>

module.exports = ItineraryPage
