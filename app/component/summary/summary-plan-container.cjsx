React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
ItinerarySummaryListContainer = require './itinerary-summary-list-container'
SearchMainContainer      = require '../search/search-main-container'
SummaryRow            = require './summary-row'
TimeNavigationButtons = require './time-navigation-buttons'
ItinerarySummary      = require '../itinerary/itinerary-summary'
LocationMarker        = require '../map/location-marker'
Map                   = require '../map/map'
ItineraryLine         = require '../map/itinerary-line'
Icon                  = require '../icon/icon'
{supportsHistory}     = require 'history/lib/DOMUtils'
sortBy                = require 'lodash/sortBy'
moment                = require 'moment'
config                = require '../../config'

class SummaryPlanContainer extends React.Component

  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired
    location: React.PropTypes.object.isRequired

  getActiveIndex: =>
    @context.location.state?.summaryPageSelected or @state?.summaryPageSelected or 0

  onSelectActive: (index) =>
    if @getActiveIndex() == index # second click navigates
      @context.router.push "#{@context.location.pathname}/#{index}"
    else if supportsHistory()
      @context.router.replace
        state: summaryPageSelected: index
        pathname: @context.location.pathname
    else
      @setState summaryPageSelected: index
      @forceReload()

  render: =>
    leafletObjs = []
    summaries = []
    from = [@props.from.lat, @props.from.lon]
    to = [@props.to.lat, @props.to.lon]

    if @props.plan and @props.plan.plan
      plan = @props.plan.plan
      currentTime = @context.getStore('TimeStore').getCurrentTime().valueOf()

      activeIndex = @getActiveIndex()

      for itinerary, i in plan.itineraries
        passive = i != activeIndex
        leafletObjs.push <ItineraryLine key={i}
          hash={i}
          legs={itinerary.legs}
          showFromToMarkers={i == 0}
          passive={passive}
        />

      leafletObjs = sortBy(leafletObjs, (i) => i.props.passive == false)

      <div className="summary">
        <Map ref="map"
          className="summaryMap"
          leafletObjs={leafletObjs}
          fitBounds={true}
          from={from}
          to={to}>
        </Map>
        <ItinerarySummaryListContainer itineraries={plan.itineraries} currentTime={currentTime} onSelect={@onSelectActive} activeIndex={activeIndex} />
        <TimeNavigationButtons plan={plan} />
      </div>
    else
      nop = -> false
      leafletObjs.push <LocationMarker
        key="from"
        position={from}
        className='from'
      />
      leafletObjs.push <LocationMarker
        key="to"
        position={to}
        className='to'
      />
      <div className="summary">
        <Map ref="map"
          className="summaryMap"
          leafletObjs={leafletObjs}
          fitBounds={true}
          from={from}
          to={to}
          padding={[0, 110]}>
          <SearchTwoFieldsContainer/>
        </Map>
        <ItinerarySummaryListContainer itineraries={[]} currentTime={currentTime} onSelect={nop} activeIndex={0} />
      </div>

module.exports = Relay.createContainer SummaryPlanContainer,
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
    preferred:
      agencies: config.preferredAgency or ""
    arriveBy: true
    disableRemainingWeightHeuristic: false
