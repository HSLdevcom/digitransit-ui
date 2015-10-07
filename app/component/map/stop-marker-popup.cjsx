React                 = require 'react'
Relay                 = require 'react-relay'
queries               = require '../../queries'
StopCardContainer     = require '../stop-cards/stop-card-container'
Icon                  = require '../icon/icon.cjsx'
Link                  = require 'react-router/lib/Link'
FavouriteStopsAction  = require '../../action/favourite-stops-action'

class StopMarkerPopup extends React.Component
  @childContextTypes:
    history: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  getChildContext: () ->
    history: @props.context.history
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
      <StopCardContainer stop={@props.stop} departures={5}/>
      <div className="bottom location">
        <Link to="#{process.env.ROOT_PATH}pysakit/#{@props.stop.gtfsId}"><Icon img={'icon-icon_time'}/> Näytä lähdöt</Link><br/>
        <Link to="#{process.env.ROOT_PATH}reitti/#{@props.context.getStore('LocationStore').getLocationString()}/#{@props.stop.name}::#{@props.stop.lat},#{@props.stop.lon}" className="route">
          <Icon img={'icon-icon_route'}/> Reititä tänne
        </Link>
      </div>
    </div>

module.exports = Relay.createContainer StopMarkerPopup,
  fragments: queries.StopMarkerPopupFragments
