React                 = require 'react'
StopCardHeader        = require '../stop-cards/stop-card-header'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/components/Link'
RouteList             = require '../stop-cards/route-list'

# Should be extracted into a separate container class
StopInformationAction = require '../../action/stop-departures-action'


class StopMarkerPopup extends React.Component
  componentDidMount: -> 
    @props.stopInformationStore.addChangeListener @onChange
    @props.nearestStopsStore.addChangeListener @onChange
    @props.executeAction StopInformationAction.stopRoutesRequest, @props.stop.id

  componentWillUnmount: ->
    @props.stopInformationStore.removeChangeListener @onChange
    @props.nearestStopsStore.removeChangeListener @onChange

  onChange: (id) =>
    if id? and id == @props.stop.id
      @forceUpdate()

  render: ->
    <div className="stop-card popup">
      <StopCardHeader stop={@props.stop} favourite={@props.favourite} addFavouriteStop={@props.addFavouriteStop} dist={@props.nearestStopsStore.getDistance(@props.stop.id)}/>
      <RouteList ref="routeList" routes={@props.stopInformationStore.getRoutes(@props.stop.id)}/>
      <div className="bottom location">
        <Link to="stop" params={{stopId: @props.stop.id}}><Icon img={'icon-icon_time'}> Näytä lähdöt</Icon></Link><br/>
        <Link to="summary" params={{to: "#{@props.stop.name}::#{@props.stop.lat},#{@props.stop.lon}", from: @props.getFrom()}} className="route"><Icon img={'icon-icon_route'}> Reititä tänne</Icon></Link>
      </div>
    </div>

module.exports = StopMarkerPopup
