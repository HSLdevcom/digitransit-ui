React                 = require 'react'
ReactDOM              = require 'react-dom'
Relay                 = require 'react-relay'
queries               = require '../../queries'
RouteNumber           = require '../departure/route-number'
RouteDestination      = require '../departure/route-destination'
DepartureTime         = require '../departure/departure-time'
StopReference         = require '../stop/stop-reference'
difference            = require 'lodash/array/difference'
filter                = require 'lodash/collection/filter'
moment                = require 'moment'
Link                  = require 'react-router/lib/Link'
cx                    = require 'classnames'

moment.locale('fi')

class StopAtDistanceListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('TimeStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('TimeStore').removeChangeListener @onChange

  onChange: (e) =>
    if e.currentTime
      @forceUpdate()

  mergeDepartures: (departures) ->
    Array.prototype.concat.apply([], departures).sort (a, b) ->
      return a.stoptime - b.stoptime

  asDepartures: (stoptimes) ->
    stoptimes.map (pattern) ->
      pattern.stoptimes.map (stoptime) ->
        stop: stoptime.stop
        canceled: stoptime.realtimeState == 'CANCELED' or (window.mock && stoptime.realtimeDeparture % 40 == 0)
        stoptime: stoptime.serviceDay + (if stoptime.realtimeState == 'CANCELED' then stoptime.scheduledDeparture else stoptime.realtimeDeparture)
        realtime: stoptime.realtime
        pattern: pattern.pattern
        trip: stoptime.trip

  now: =>
    @context.getStore('TimeStore').getCurrentTime()

  getDepartures: (rowClasses) =>
    departureObjs = []

    currentTime = @now().unix()
    currentDate = @now().startOf('day').unix()
    tomorrow = @now().add(1, 'day').startOf('day').unix()
    departures = @mergeDepartures(@asDepartures(@props.stoptimes))
      .filter((departure) -> currentTime < departure.stoptime)
      .slice 0, @props.limit

    for departure, i in departures
      if departure.stoptime >= tomorrow
        departureObjs.push <div key={moment(departure.stoptime * 1000).format('DDMMYYYY')} className="date-row border-bottom">
          {moment(departure.stoptime * 1000).format('dddd D.M.YYYY')}
        </div>
        currentDate = tomorrow
        tomorrow = moment.unix(currentDate).add(1, 'day').startOf('day').unix()
      id = "#{departure.pattern.code}:#{departure.stoptime}"

      validAt = (alert) =>
        alert.effectiveStartDate <= departure.stoptime &&
          departure.stoptime <= alert.effectiveEndDate &&
          (not alert.trip?.gtfsId or (alert.trip.gtfsId == departure.trip?.gtfsId))

      classes =
        disruption: (filter departure.pattern.alerts, validAt).length > 0
        canceled: departure.canceled

      if rowClasses
        classes[rowClasses] = true

      if @props.routeLinks
        departureObjs.push <Link to="/linjat/#{departure.pattern.code}" key={id}>
          <Departure departure={departure} showStop={@props.showStops} currentTime={currentTime} className={cx classes} canceled={departure.canceled} />
        </Link>
      else
        departureObjs.push <Departure key={id} departure={departure} showStop={@props.showStops} currentTime={currentTime} className={cx classes} canceled={departure.canceled} />

    departureObjs

  render: =>
    currentTime = @now().unix()
    departure = @props.stopAtDistance
    stoptimeObjs = []
    for stoptime in departure.stop.stoptimes
      departureTimes = []
      for departure in stoptime.stoptimes
        canceled =  departure.realtimeState == 'CANCELED' or (window.mock && departure.realtimeDeparture % 40 == 0)
        departureTimes.push <DepartureTime
          key={Math.random()}
          departureTime={departure.serviceDay + departure.realtimeDeparture}
          realtime={departure.realtime}
          currentTime={currentTime}
          canceled={canceled} />

      stoptimeObjs.push <Link to="/linjat/#{stoptime.pattern.code}" key={stoptime.pattern.code}>
        <div className="stop-departure-row padding-normal border-bottom">
          <span className="distance">{(@props.stopAtDistance.distance // 10) * 10 + "m"}</span>
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
      {stoptimeObjs}
    </div>

module.exports = Relay.createContainer StopAtDistanceListContainer,
  fragments: queries.StopAtDistanceListContainerFragments
