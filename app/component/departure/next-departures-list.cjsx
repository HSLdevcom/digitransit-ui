React      = require 'react'
Relay      = require 'react-relay'
queries    = require '../../queries'
Distance         = require './distance'
RouteNumber      = require './route-number'
RouteDestination = require './route-destination'
DepartureTime    = require './departure-time'
Link       = require 'react-router/lib/Link'
config     = require '../../config'
moment     = require 'moment'
sortBy     = require 'lodash/sortBy'
intl       = require 'react-intl'

FormattedMessage = intl.FormattedMessage

NextDeparturesList = (props) ->
  departureObjs = []
  for departure in props.departures
    distance = departure.distance
    roundedDistance =
      if distance < 1000
        (distance - distance % 10) / 1000
      else
        (distance - distance % 100) / 1000
    departure.roundedDistance = roundedDistance

    firstTime = departure.stoptimes[0]?.stoptimes[0]
    departure.stoptime = firstTime?.serviceDay +
      if firstTime?.realtime
        firstTime.realtimeDeparture
      else
        firstTime?.scheduledDeparture

  sortedDepartures = sortBy props.departures, ['roundedDistance', 'stoptime']

  for departure in sortedDepartures
    for stoptime in departure.stoptimes
      departureTimes = []
      for departureTime in stoptime.stoptimes
        canceled =  departureTime.realtimeState == 'CANCELED' or (window.mock && departureTime.realtimeDeparture % 40 == 0)
        key = stoptime.pattern.route.gtfsId + ":" + stoptime.pattern.headsign + ":" + departureTime.realtimeDeparture
        departureTimes.push <DepartureTime
          key={key}
          departureTime={departureTime.serviceDay + departureTime.realtimeDeparture}
          realtime={departureTime.realtime}
          currentTime={props.currentTime}
          canceled={canceled} />

      departureObjs.push <Link to="/linjat/#{stoptime.pattern.code}" key={stoptime.pattern.code}>
        <div className="next-departure-row padding-vertical-normal border-bottom">
          <Distance distance={departure.distance}/>
          <RouteNumber
            mode={stoptime.pattern.route.type}
            realtime={false}
            text={stoptime.pattern.route.shortName} />
          <RouteDestination
            mode={stoptime.pattern.route.type}
            destination={stoptime.pattern.headsign or stoptime.pattern.route.longName} />
          {departureTimes}
        </div>
      </Link>

  <div>
    {departureObjs}
  </div>

NextDeparturesList.displayName = "NextDeparturesList"

module.exports = NextDeparturesList
