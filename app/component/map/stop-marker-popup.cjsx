React                 = require 'react'
StopCardHeader        = require '../stop-cards/stop-card-header'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/components/Link'
RouteList             = require '../stop-cards/route-list'
FavouriteStopsAction  = require '../../action/favourite-stops-action'


# Should be extracted into a separate container class
StopInformationAction = require '../../action/stop-departures-action'


class StopMarkerPopup extends React.Component
  componentDidMount: ->
    @props.context.getStore('StopInformationStore').addChangeListener @onChange
    @props.context.getStore('NearestStopsStore').addChangeListener @onChange
    @props.context.getStore('FavouriteStopsStore').addChangeListener @onChange
    @props.context.executeAction StopInformationAction.stopRoutesRequest, @props.stop.id

  componentWillUnmount: ->
    @props.context.getStore('StopInformationStore').removeChangeListener @onChange
    @props.context.getStore('NearestStopsStore').removeChangeListener @onChange
    @props.context.getStore('FavouriteStopsStore').addChangeListener @onChange

  onChange: (id) =>
    if id? and id == @props.stop.id
      @forceUpdate()

  render: ->
    favourite = @props.context.getStore('FavouriteStopsStore').isFavourite(@props.stop.id)
    addFavouriteStop = (e) =>
      console.log e
      e.stopPropagation()
      @props.context.executeAction FavouriteStopsAction.addFavouriteStop, @props.stop.id

    <div className="stop-card popup">
      <StopCardHeader stop={@props.stop} favourite={favourite} addFavouriteStop={addFavouriteStop} dist={@props.context.getStore('NearestStopsStore').getDistance(@props.stop.id)}/>
      <RouteList ref="routeList" routes={@props.context.getStore('StopInformationStore').getRoutes(@props.stop.id)}/>
      <div className="bottom location">
        <Link to="stop" params={{stopId: @props.stop.id}}><Icon img={'icon-icon_time'}> Näytä lähdöt</Icon></Link><br/>
        <Link to="summary" params={{to: "#{@props.stop.name}::#{@props.stop.lat},#{@props.stop.lon}", from: @props.context.getStore('LocationStore').getLocationString()}} className="route"><Icon img={'icon-icon_route'}> Reititä tänne</Icon></Link>
      </div>
    </div>

module.exports = StopMarkerPopup
