React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
NextDeparturesList = require '../departure/next-departures-list'
config             = require '../../config'
sortBy             = require 'lodash/sortBy'
NoPositionPanel    = require '../front-page/no-position-panel'

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

  toRadians: (x) ->
    x * Math.PI / 180

  haversine: (lat1, lon1, lat2, lon2) ->
    R = 6371000 # metres
    φ1 = @toRadians(lat1)
    φ2 = @toRadians(lat2)
    Δφ = @toRadians(lat2 - lat1)
    Δλ = @toRadians(lon2 - lon1)
    a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ/2) * Math.sin(Δλ/2)
    c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    d = R * c
    d

  getNextDepartures: (lat, lon) =>
    nextDepartures = []
    seenDepartures = {}
    for route in @props.routes
      for pattern in route.patterns
        closestDistance = false
        for stop in pattern.stops
          dx = stop.lon - lon
          dy = stop.lat - lat
          distance = @haversine(lat, lon, stop.lat, stop.lon)
          if not closestDistance or distance < closestDistance
            closestStop = stop
            closestDistance = distance

        keepStoptimes = []
        for stoptime in closestStop.stoptimes
          seenKey =  stoptime.pattern.route.gtfsId + ":" + stoptime.pattern.headsign
          isSeen = seenDepartures[seenKey]
          isFavourite = stoptime.pattern.route.gtfsId == route.gtfsId and stoptime.pattern.headsign == pattern.headsign
          isPickup = true #stoptime.stoptimes[0]?.pickupType != "NONE"
          if !isSeen and isFavourite and isPickup
            keepStoptimes.push stoptime
            seenDepartures[seenKey] = true
        nextDepartures.push
          distance: closestDistance
          stoptimes: keepStoptimes

    nextDepartures = sortBy nextDepartures, 'distance'

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
