React                 = require 'react'
ReactDom              = require 'react-dom'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Departure             = require './departure'
uniq                  = require 'lodash/array/uniq'
difference            = require 'lodash/array/difference'
moment                = require 'moment'
Link                  = require 'react-router/lib/Link'
classNames            = require 'classnames'


moment.locale('fi')

class DepartureListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

  constructor: (props) ->
    @state =
      departures: Array.prototype.concat.apply([], @getStoptimes props.stop.stopTimes).sort (a, b) ->
        return a.stoptime - b.stoptime
      loading: false

  getStoptimes: (stoptimes) ->
    stoptimes.map (pattern) ->
      pattern.stoptimes.map (stoptime) ->
        stoptime: stoptime.serviceDay + stoptime.realtimeDeparture
        realtime: stoptime.realtime
        pattern: pattern.pattern

  componentDidMount: ->
    if @props.infiniteScroll
      @scrollHandler target: ReactDom.findDOMNode this
    @context.getStore('DisruptionStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('DisruptionStore').removeChangeListener @onChange

  onChange: () =>
    @forceUpdate()

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

  getDepartures: (showMissingRoutes, rowClasses) =>
    departureObjs = []
    seenRoutes = []
    disruptionRoutes = @context.getStore('DisruptionStore').getRoutes() or []
    currentTime = new Date().getTime() / 1000
    currentDate = new Date().setHours(0, 0, 0, 0) / 1000
    for departure, i in @state.departures
      if departure.stoptime > currentDate + 86400 # TODO: test for DST change dates
        departureObjs.push <div key={moment(departure.stoptime * 1000).format('DDMMYYYY')} className="date-row">
          {moment(departure.stoptime * 1000).format('dddd D.M.YYYY')}
        </div>
        currentDate = new Date().setHours(24, 0, 0, 0) / 1000
      if currentTime < departure.stoptime
        id = "#{departure.pattern.code}:#{departure.stoptime}"

        # check if departure is in the disruption info
        classes =
          disruption: disruptionRoutes.indexOf(departure.pattern.code.split(":", 3).join(':')) != -1
        if rowClasses
          classes[rowClasses] = true

        if @props.routeLinks
          departureObjs.push <Link to="#{process.env.ROOT_PATH}linjat/#{departure.pattern.code}" key={id}>
            <Departure departure={departure} currentTime={currentTime} className={classNames(classes)} />
          </Link>
        else
          departureObjs.push <Departure key={id} departure={departure} currentTime={currentTime} className={classNames(classes)} />
        seenRoutes.push(departure.pattern.route.shortName)
        if seenRoutes.length >= @props.departures
          break

    if showMissingRoutes
      missingRoutes = difference((stop.routes.map (route) -> route.shortName), seenRoutes).sort()
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
      {@getDepartures(@props.showMissingRoutes, @props.rowClasses)}
    </div>

module.exports = Relay.createContainer(DepartureListContainer,
  fragments: queries.DepartureListFragments
  initialVariables:
    date: moment().format("YYYYMMDD")
)
