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
intl       = require 'react-intl'

FormattedMessage = intl.FormattedMessage

NextDeparturesList = (props) ->
  departureObjs = []
  for departure in props.departures
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
