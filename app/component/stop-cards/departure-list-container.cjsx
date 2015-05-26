React                 = require 'react'
Departure             = require './departure'
StopDeparturesActions = require '../../action/stop-departures-action'
uniq                  = require 'lodash/array/uniq'
difference            = require 'lodash/array/difference'
moment                = require 'moment'
Link               = require 'react-router/lib/components/Link'


class DepartureListContainer extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  componentDidMount: -> 
    @context.getStore('StopDeparturesStore').addChangeListener @onChange
    if !@context.getStore('StopDeparturesStore').getInitialStopsFetchInProgress()
      if @context.getStore('StopDeparturesStore').getDepartures(@props.stop) == undefined
        @context.executeAction StopDeparturesActions.stopDeparturesRequest, @props.stop

  componentWillUnmount: ->
    @context.getStore('StopDeparturesStore').removeChangeListener @onChange

  componentDidUpdate: ->
    if @props.reloadMasonry
      @props.reloadMasonry()

  onChange: (id) =>
    if !id or id == @props.stop
      @forceUpdate()

  componentDidUpdate: ->
    if !@context.getStore('StopDeparturesStore').getInitialStopsFetchInProgress()
      if @props.reloadMasonry?
        @props.reloadMasonry()

  getDepartures: (showMissingRoutes) =>
    departureObjs = []
    seenRoutes = []
    departures = @context.getStore('StopDeparturesStore').getDepartures(@props.stop)
    if !departures
      return false
    for departure, i in departures
      if moment().isBefore((departure.time.serviceDay + departure.time.scheduledDeparture)*1000)
        id = departure.pattern.id + departure.time.serviceDay + departure.time.scheduledDeparture
        routeParts = departure.pattern.id.split(":")
        if @props.routeLinks
          departureObjs.push <Link to="route" params={{routeId: routeParts[0] + ":" + routeParts[1]}}><Departure key={id} departure={departure} /></Link>
        else
          departureObjs.push <Departure key={id} departure={departure} />
        seenRoutes.push(departure.pattern.shortName)
        if seenRoutes.length >= @props.departures
          break

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
    <div className={"departure-list" + (if @props.className then " " + @props.className else "")}>
      {@getDepartures(@props.showMissingRoutes)}
    </div>

module.exports = DepartureListContainer