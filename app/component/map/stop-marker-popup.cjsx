React                 = require 'react'
StopCardHeader        = require '../stop-cards/stop-card-header'
Icon                  = require '../icon/icon.cjsx'
Link                  = require('react-router/lib/Link').Link
RouteList             = require '../stop-cards/route-list'
FavouriteStopsAction  = require '../../action/favourite-stops-action'

class StopMarkerPopup extends React.Component
  @childContextTypes:
    router: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  getChildContext: () ->
    router: @props.context.router
    route: @props.context.route

  componentDidMount: ->
    @props.context.getStore('FavouriteStopsStore').addChangeListener @onChange

  componentWillUnmount: ->
    @props.context.getStore('FavouriteStopsStore').addChangeListener @onChange

  onChange: (id) =>
    if id? and id == @props.stop.id
      @forceUpdate()

  render: ->
    favourite = @props.context.getStore('FavouriteStopsStore').isFavourite(@props.stop.id)
    addFavouriteStop = (e) =>
      e.stopPropagation()
      @props.context.executeAction FavouriteStopsAction.addFavouriteStop, @props.stop.id

    <div className="card">
      <StopCardHeader stop={@props.stop} favourite={favourite} addFavouriteStop={addFavouriteStop}/>
      <RouteList ref="routeList" routes={@props.stop.routes}/>
      <div className="bottom location">
        <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.stop.gtfsId}"><Icon img={'icon-icon_time'}> Näytä lähdöt</Icon></Link><br/>
        <Link to="#{process.env.ROOT_PATH}reitti/#{@props.context.getStore('LocationStore').getLocationString()}/#{@props.stop.name}::#{@props.stop.lat},#{@props.stop.lon}" className="route">
          <Icon img={'icon-icon_route'}> Reititä tänne
          </Icon>
        </Link>
      </div>
    </div>

module.exports = StopMarkerPopup
