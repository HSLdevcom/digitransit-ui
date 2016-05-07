React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
NextDeparturesList = require '../departure/next-departures-list'
config             = require '../../config'
NoPositionPanel    = require '../front-page/no-position-panel'
util               = require '../../util/geo-utils'
connectToStores    = require 'fluxible-addons-react/connectToStores'


class FavouriteRouteListContainer extends React.Component
  @propTypes:
    routes: React.PropTypes.array

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

        for stoptime in keepStoptimes
          nextDepartures.push
            distance: closest.distance
            stoptime: stoptime

    nextDepartures

  render: =>
    if @props.location
      <NextDeparturesList departures={@getNextDepartures(@props.location.lat, @props.location.lon)} currentTime={@props.currentTime.unix()}/>
    else if @props.searching
      <div className="spinner-loader"/>
    else
      <NoPositionPanel/>


FavouriteRouteListContainerWithTime = connectToStores FavouriteRouteListContainer, ['TimeStore'], (context, props) ->
  PositionStore = context.getStore('PositionStore')
  position = PositionStore.getLocationState()
  origin = context.getStore('EndpointStore').getOrigin()

  currentTime: context.getStore('TimeStore').getCurrentTime()
  searching: position.status == PositionStore.STATUS_SEARCHING_LOCATION
  location:
    if origin.useCurrentPosition
      if position.hasLocation
        position
      else
        false
    else
      origin

module.exports = Relay.createContainer(FavouriteRouteListContainerWithTime,
  fragments: queries.FavouriteRouteListContainerFragments
  initialVariables:
    ids: null
)
