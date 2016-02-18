React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
NextDeparturesList = require '../departure/next-departures-list'
config             = require '../../config'
NoPositionPanel    = require '../front-page/no-position-panel'
util               = require '../../util/geo-utils'

class FavouriteRouteListContainer extends React.Component

  @propTypes:
    routes: React.PropTypes.array

  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('TimeStore').addChangeListener @onTimeChange

  componentWillUnmount: ->
    @context.getStore('TimeStore').removeChangeListener @onTimeChange

  onTimeChange: (e) =>
    if e.currentTime
      @forceUpdate()

  getNextDepartures: (lat, lon) =>
    nextDepartures = []
    seenDepartures = {}
    for route in @props.routes
      for pattern in route.patterns
        closest = util.getDistanceToNearestStop lat, lon, pattern.stops

        keepStoptimes = []
        for stoptime in closest.stop.stoptimes
          seenKey =  stoptime.pattern.route.gtfsId + ":" + stoptime.pattern.headsign
          isSeen = seenDepartures[seenKey]
          isFavourite = stoptime.pattern.route.gtfsId == route.gtfsId and stoptime.pattern.headsign == pattern.headsign
          isPickup = true #stoptime.stoptimes[0]?.pickupType != "NONE"
          if !isSeen and isFavourite and isPickup
            keepStoptimes.push stoptime
            seenDepartures[seenKey] = true

        nextDepartures.push
          distance: closest.distance
          stoptimes: keepStoptimes

    nextDepartures

  now: =>
    @context.getStore('TimeStore').getCurrentTime()

  render: =>
    PositionStore = @context.getStore 'PositionStore'
    location = PositionStore.getLocationState()
    origin = @context.getStore('EndpointStore').getOrigin()

    if origin?.lat
      routesPanel = <NextDeparturesList departures={@getNextDepartures(origin.lat, origin.lon)} currentTime={@now().unix()}/>

    else if (location.status == PositionStore.STATUS_FOUND_LOCATION or
             location.status == PositionStore.STATUS_FOUND_ADDRESS)
      routesPanel = <NextDeparturesList departures={@getNextDepartures(location.lat, location.lon)} currentTime={@now().unix()}/>
    else if location.status == PositionStore.STATUS_SEARCHING_LOCATION
      routesPanel = <div className="spinner-loader"/>
    else
      routesPanel = <NoPositionPanel/>

    routesPanel

module.exports = Relay.createContainer(FavouriteRouteListContainer,
  fragments: queries.FavouriteRouteListContainerFragments
  initialVariables:
    ids: null
)
