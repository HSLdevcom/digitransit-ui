React                 = require 'react'
ReactDom              = require 'react-dom'
Departure             = require './departure'
StopDeparturesActions = require '../../action/stop-departures-action'
uniq                  = require 'lodash/array/uniq'
difference            = require 'lodash/array/difference'
moment                = require 'moment'
Link                  = require('react-router/lib/Link').Link

moment.locale('fi')

class DepartureListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: ->
    @context.getStore('StopDeparturesStore').addChangeListener @onChange
    if !@context.getStore('StopDeparturesStore').getInitialStopsFetchInProgress()
      if @context.getStore('StopDeparturesStore').getDepartures(@props.stop) == undefined
        @context.executeAction StopDeparturesActions.stopDeparturesRequest, @props.stop
    if @props.infiniteScroll
      @scrollHandler target: ReactDom.findDOMNode this

  componentWillUnmount: ->
    @context.getStore('StopDeparturesStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.stop
      @forceUpdate()

  scrollHandler: (e) =>
    if (e.target.scrollHeight-e.target.scrollTop-e.target.offsetHeight) < 250 and !@context.getStore('StopDeparturesStore').getAdditionalStopsFetchInProgress()
      @context.executeAction StopDeparturesActions.nextDayStopDeparturesRequest, @props.stop

  getDepartures: (showMissingRoutes) =>
    departureObjs = []
    seenRoutes = []
    previousTime = moment()
    departures = @context.getStore('StopDeparturesStore').getDepartures(@props.stop)
    if !departures
      return false
    for departure, i in departures
      departureTime = moment((departure.time.serviceDay + departure.time.scheduledDeparture)*1000)
      if !departureTime.isSame(previousTime, 'day')
        departureObjs.push <div key={departureTime.format('DDMMYYYY')} className="date-row">{departureTime.format('dddd D.M.YYYY')}</div>
      if moment().isBefore(departureTime)
        id = departure.pattern.id + departure.time.serviceDay + departure.time.scheduledDeparture
        if @props.routeLinks
          departureObjs.push <Link to="#{process.env.ROOT_PATH}linjat/#{departure.pattern.id}" key={id}><Departure departure={departure}/></Link>
        else
          departureObjs.push <Departure key={id} departure={departure} />
        seenRoutes.push(departure.pattern.shortName)
        if seenRoutes.length >= @props.departures
          break
      previousTime = departureTime

    if showMissingRoutes
      missingRoutes = difference(uniq(departure.pattern.shortName for departure in departures), seenRoutes)
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
    <div className={"departure-list" + (if @props.className then " " + @props.className else "")} onScroll={if @props.infiniteScroll and window? then @scrollHandler else null}>
      {@getDepartures(@props.showMissingRoutes)}
    </div>

module.exports = DepartureListContainer
