React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
NextDeparturesList = require '../departure/next-departures-list'
NoPositionPanel    = require '../front-page/no-position-panel'
{getDistanceToNearestStop} = require '../../util/geo-utils'
connectToStores    = require 'fluxible-addons-react/connectToStores'

getNextDepartures = (routes, lat, lon) ->
  nextDepartures = []
  seenDepartures = {}
  for route in routes
    for pattern in route.patterns
      closest = getDistanceToNearestStop lat, lon, pattern.stops

      keepStoptimes = []
      for stoptime in closest.stop.stoptimes
        seenKey =  stoptime.pattern.route.gtfsId + ":" + stoptime.pattern.headsign
        isSeen = seenDepartures[seenKey]
        isFavourite = stoptime.pattern.route.gtfsId == route.gtfsId and stoptime.pattern.headsign == pattern.headsign
        if !isSeen and isFavourite
          keepStoptimes.push stoptime
          seenDepartures[seenKey] = true

      for stoptime in keepStoptimes
        nextDepartures.push
          distance: closest.distance
          stoptime: stoptime

  nextDepartures

FavouriteRouteListContainer = ({location, currentTime, searching, routes}) ->
  if location
    <NextDeparturesList departures={getNextDepartures(routes, location.lat, location.lon)} currentTime={currentTime.unix()}/>
  else if searching
    <div className="spinner-loader"/>
  else
    <NoPositionPanel/>

FavouriteRouteListContainer.propTypes =
  routes: React.PropTypes.array
  currentTime: React.PropTypes.object
  searching: React.PropTypes.bool
  location: React.PropTypes.oneOfType([React.PropTypes.object, React.PropTypes.bool]).isRequired

FavouriteRouteListContainerWithTime = connectToStores FavouriteRouteListContainer, ['TimeStore'], (context, props) ->
  PositionStore = context.getStore('PositionStore')
  position = PositionStore.getLocationState()
  origin = context.getStore('EndpointStore').getOrigin()

  currentTime: context.getStore('TimeStore').getCurrentTime()
  searching: position.status == PositionStore.STATUS_SEARCHING_LOCATION
  location:
    if origin.useCurrentPosition
      if position.hasLocation then position else false
    else
      origin

module.exports = Relay.createContainer(FavouriteRouteListContainerWithTime,
  fragments: queries.FavouriteRouteListContainerFragments
  initialVariables:
    ids: null
)
