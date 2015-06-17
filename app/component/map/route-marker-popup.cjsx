React                 = require 'react'
RouteHeader           = require '../route/route-header'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/components/Link'
FavouriteStopsAction  = require '../../action/favourite-stops-action'
GtfsUtils             = require '../../util/gtfs'


class RouteMarkerPopup extends React.Component
  @childContextTypes:
    router: React.PropTypes.func.isRequired

  getChildContext: () ->
    router: @props.context.router

  componentDidMount: -> 
    @props.context.getStore('RouteInformationStore').addChangeListener @onChange
    #@props.context.getStore('FavouriteStopsStore').addChangeListener @onChange
    #@props.context.executeAction StopInformationAction.stopRoutesRequest, @props.stop.id

  componentWillUnmount: ->
    @props.context.getStore('RouteInformationStore').removeChangeListener @onChange
    #@props.context.getStore('FavouriteStopsStore').addChangeListener @onChange

  onChange: (id) =>
    if !id or id.split(':',2).join(':') == "HSL:" + @props.route or id == "HSL:" + @props.route
      @forceUpdate()

  render: ->
    route = @props.context.getStore('RouteInformationStore').getRoute("HSL:" + @props.route)

    details =
      route: "HSL:" + @props.route
      date: @props.date
      direction: @props.direction
      trip: @props.trip

    trip = @props.context.getStore('RouteInformationStore').getFuzzyTrip(details)

    <div className="trip-card popup">
      <RouteHeader route={route} pattern={@props.context.getStore('RouteInformationStore').getPattern(trip.pattern.id)} trip={@props.trip}/>
      <div className="bottom location">
        <Link to="trip" params={{tripId: trip.id}}><Icon img={'icon-icon_time'}> Lähdön tiedot</Icon></Link><br/>
        <Link to="route" params={{routeId: trip.pattern.id}} className="route"><Icon img={'icon-icon_' + GtfsUtils.typeToName[route.type] + "-withoutBox"}> Linjan tiedot</Icon></Link>
      </div>
    </div>

module.exports = RouteMarkerPopup
