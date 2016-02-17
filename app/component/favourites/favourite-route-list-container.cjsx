React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../../queries'
NextDeparturesList = require '../departure/next-departures-list'
config             = require '../../config'

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

  getNextDepartures: =>
    nextDepartures = []
    seenDepartures = {}
    console.log 'routes'
    console.log @props.routes
    for route in @props.routes
      console.log 'patterns'
      console.log route.patterns
      for pattern in route.patterns
        console.log 'stops'
        console.log pattern.stops
        for stop in pattern.stops
          closestStop = stop

        console.log 'closest stop'
        console.log closestStop
        keepStoptimes = []
        for stoptime in closestStop.stoptimes
          console.log 'stoptimes'
          console.log stoptime.stoptimes
          seenKey =  stoptime.pattern.route.gtfsId + ":" + stoptime.pattern.headsign
          isSeen = seenDepartures[seenKey]
          isFavourite = stoptime.pattern.route.gtfsId == route.gtfsId
          isPickup = stoptime.stoptimes[0]?.pickupType != "NONE"
          if !isSeen and isFavourite and isPickup
            keepStoptimes.push stoptime
            seenDepartures[seenKey] = true
        nextDepartures.push
          distance: 0
          stoptimes: keepStoptimes

    console.log nextDepartures

    nextDepartures

  now: =>
    @context.getStore('TimeStore').getCurrentTime()

  render: =>
    <NextDeparturesList departures={@getNextDepartures()} currentTime={@now().unix()}/>


module.exports = Relay.createContainer(FavouriteRouteListContainer,
  fragments: queries.FavouriteRouteListContainerFragments
  initialVariables:
    ids: null
)
