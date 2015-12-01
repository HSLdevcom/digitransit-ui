React                 = require 'react'
ReactDOM              = require 'react-dom'
Relay                 = require 'react-relay'
queries               = require '../../queries'
Departure             = require './departure'
difference            = require 'lodash/array/difference'
moment                = require 'moment'
Link                  = require 'react-router/lib/Link'
cx                    = require 'classnames'


moment.locale('fi')

class DepartureListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired

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

  componentDidMount: ->
    # if @props.infiniteScroll
    #   @scrollHandler target: ReactDOM.findDOMNode this #Should be in parent
    @context.getStore('DisruptionStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('DisruptionStore').removeChangeListener @onChange

  onChange: () =>
    @forceUpdate()

  # scrollHandler: (e) =>
  #   if (e.target.scrollHeight-e.target.scrollTop-e.target.offsetHeight) < 250 and !@state.loading
  #     @props.relay.setVariables
  #       date: moment(@props.relay.variables.date, "YYYYMMDD").add(1, 'd').format("YYYYMMDD")
  #     @setState loading: true

  # componentWillReceiveProps: (newProps) ->
  #   if newProps.useState && newProps.relay.variables.date != @props.relay.variables.date
  #     @setState
  #       departures: @mergeDepartures @state.departures, @asDepartures newProps.stoptimes
  #       loading: false

  getDepartures: (rowClasses) =>
    departureObjs = []
    #seenRoutes = []
    disruptionRoutes = @context.getStore('DisruptionStore').getRoutes() or []
    currentTime = new Date().getTime() / 1000
    currentDate = new Date().setHours(0, 0, 0, 0) / 1000
    for departure, i in @mergeDepartures(@asDepartures(@props.stoptimes)).filter((departure) -> currentTime < departure.stoptime).slice 0, @props.limit
      if departure.stoptime > currentDate + 86400 # TODO: test for DST change dates
        departureObjs.push <div key={moment(departure.stoptime * 1000).format('DDMMYYYY')} className="date-row border-bottom">
          {moment(departure.stoptime * 1000).format('dddd D.M.YYYY')}
        </div>
        currentDate = new Date().setHours(24, 0, 0, 0) / 1000 #TODO: this should be changed, now always sets tomorrow
      id = "#{departure.pattern.code}:#{departure.stoptime}"

      # check if departure is in the disruption info
      classes =
        disruption: disruptionRoutes.indexOf(departure.pattern.code.split(":", 3).join(':')) != -1
      if rowClasses
        classes[rowClasses] = true

      if @props.routeLinks
        departureObjs.push <Link to="/linjat/#{departure.pattern.code}" key={id}>
          <Departure departure={departure} showStop={@props.showStops} currentTime={currentTime} className={cx classes}/>
        </Link>
      else
        departureObjs.push <Departure key={id} departure={departure} showStop={@props.showStops} currentTime={currentTime} className={cx classes} />
      #seenRoutes.push(departure.pattern.route.shortName)
      #if seenRoutes.length >= @props.limit
      #  break

    # TODO: enable again
    # if @props.routes
    #   missingRoutes = difference(@props.routes, seenRoutes).sort()
    #   if missingRoutes.length == 1
    #     departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linja {missingRoutes[0]}</p>
    #   else if missingRoutes.length == 2
    #     departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linjat {missingRoutes[0]} ja {missingRoutes[1]}</p>
    #   else
    #     departureObjs.push <p key="missingRoutes" className="missing-routes">Lisäksi linjat {missingRoutes.slice(0, -1).join ', '} ja {missingRoutes[missingRoutes.length - 1]}</p>
    departureObjs

  render: =>
    <div className={cx "departure-list", @props.className}
         onScroll={if @props.infiniteScroll and window? then @scrollHandler else null}>
      {@getDepartures(@props.rowClasses)}
    </div>

module.exports = Relay.createContainer DepartureListContainer,
  fragments: queries.DepartureListFragments
