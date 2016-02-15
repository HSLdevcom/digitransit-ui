React      = require 'react'
Relay      = require 'react-relay'
queries    = require '../../queries'
RouteNumber      = require './route-number'
RouteDestination = require './route-destination'
DepartureTime    = require './departure-time'
Link       = require 'react-router/lib/Link'
sortBy     = require 'lodash/collection/sortBy'
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
        <div className="stop-departure-row padding-normal border-bottom">
          <span className="distance">{(departure.distance // 10) * 10 + "m"}</span>
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
    <div className="departure-list-header padding-vertical-small">
      <span className="right">
        <FormattedMessage
          id='stop-number'
          defaultMessage="Stop number"/>
      </span>
    </div>

    {departureObjs}
  </div>

NextDeparturesList.displayName = "NextDeparturesList"

module.exports = NextDeparturesList
