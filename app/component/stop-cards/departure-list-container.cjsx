React                 = require 'react'
ReactDom              = require 'react-dom'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Departure             = require './departure'
uniq                  = require 'lodash/array/uniq'
difference            = require 'lodash/array/difference'
moment                = require 'moment'
Link                  = require('react-router/lib/Link').Link
classNames            = require 'classnames'


moment.locale('fi')

class DepartureListContainer extends React.Component
  constructor: (props) ->
    @state =
      departures: Array.prototype.concat.apply([], @getStoptimes props.stop.stopTimes).sort (a, b) ->
        return a.stoptime - b.stoptime
      loading: false

  getStoptimes: (stoptimes) ->
    stoptimes.map (pattern) ->
      pattern.stoptimes.map (stoptime) ->
        stoptime: moment(stoptime.serviceDay, "YYYY-MM-DD").add(stoptime.realtimeDeparture, 's')
        realtime: stoptime.realtime
        pattern: pattern.pattern

  componentDidMount: ->
    if @props.infiniteScroll
      @scrollHandler target: ReactDom.findDOMNode this

  scrollHandler: (e) =>
    if (e.target.scrollHeight-e.target.scrollTop-e.target.offsetHeight) < 250 and !@state.loading
      @props.relay.setVariables
        date: moment(@props.relay.variables.date, "YYYYMMDD").add(1, 'd').format("YYYYMMDD")
      @setState loading: true

  componentWillReceiveProps: (newProps) ->
    if newProps.relay.variables.date != @props.relay.variables.date
      @setState
        departures: Array.prototype.concat.apply(
          @state.departures, @getStoptimes newProps.stop.stopTimes).sort (a, b) ->
            return a.stoptime - b.stoptime
        loading: false

  getDepartures: (showMissingRoutes) =>
    departureObjs = []
    seenRoutes = []
    previousTime = moment()
    for departure, i in @state.departures
      if departure.stoptime.isAfter(previousTime, 'day')
        departureObjs.push <div key={departure.stoptime.format('DDMMYYYY')} className="date-row">
          {departure.stoptime.format('dddd D.M.YYYY')}
        </div>
      if moment().isBefore(departure.stoptime)
        id = "#{departure.pattern.code}:#{departure.stoptime.valueOf()}"
        if @props.routeLinks
          departureObjs.push <Link to="#{process.env.ROOT_PATH}linjat/#{departure.pattern.code}" key={id}>
            <Departure departure={departure}/>
          </Link>
        else
          departureObjs.push <Departure key={id} departure={departure} />
        seenRoutes.push(departure.pattern.route.shortName)
        if seenRoutes.length >= @props.departures
          break
      previousTime = departure.stoptime

    if showMissingRoutes
      missingRoutes = difference(uniq(departure.pattern.route.shortName for departure in departures), seenRoutes)
      missingRoutes.sort()
      if missingRoutes.length == 0
      else if missingRoutes.length == 1
        departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linja {missingRoutes[0]}</p>
      else if missingRoutes.length == 2
        departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linjat {missingRoutes[0]} ja {missingRoutes[1]}</p>
      else
        departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linjat {missingRoutes.slice(0,-1).join ', '} ja {missingRoutes[missingRoutes.length-1]}</p>
    departureObjs

  render: =>
    <div className={classNames("departure-list", @props.className)}
         onScroll={if @props.infiniteScroll and window? then @scrollHandler else null}>
      {@getDepartures(@props.showMissingRoutes)}
    </div>

module.exports = Relay.createContainer(DepartureListContainer,
  fragments: queries.DepartureListFragments
  initialVariables:
    date: moment().format("YYYYMMDD")
)
