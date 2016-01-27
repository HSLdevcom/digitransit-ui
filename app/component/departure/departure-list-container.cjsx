React                 = require 'react'
ReactDOM              = require 'react-dom'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Departure             = require './departure'
difference            = require 'lodash/array/difference'
filter                = require 'lodash/collection/filter'
moment                = require 'moment'
Link                  = require 'react-router/lib/Link'
cx                    = require 'classnames'

moment.locale('fi')

class DepartureListContainer extends React.Component
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
        stoptime: stoptime.serviceDay + stoptime.realtimeDeparture
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

      if rowClasses
        classes[rowClasses] = true

      if @props.routeLinks
        departureObjs.push <Link to="/linjat/#{departure.pattern.code}" key={id}>
          <Departure departure={departure} showStop={@props.showStops} currentTime={currentTime} className={cx classes}/>
        </Link>
      else
        departureObjs.push <Departure key={id} departure={departure} showStop={@props.showStops} currentTime={currentTime} className={cx classes} />

    departureObjs

  render: =>
    <div className={cx "departure-list", @props.className}
         onScroll={if @props.infiniteScroll and window? then @scrollHandler else null}>
      {@getDepartures(@props.rowClasses)}
    </div>

module.exports = Relay.createContainer DepartureListContainer,
  fragments: queries.DepartureListFragments
