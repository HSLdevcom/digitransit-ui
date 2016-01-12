React              = require 'react'
Relay              = require 'react-relay'
queries            = require '../queries'
DefaultNavigation  = require '../component/navigation/default-navigation'
Map                = require '../component/map/map'
DepartureListContainer = require '../component/departure/departure-list-container'
StopCardHeader     = require '../component/stop-cards/stop-card-header'
FavouriteStopsAction = require '../action/favourite-stops-action'
Link               = require 'react-router/lib/Link'
Icon               = require '../component/icon/icon'
moment             = require 'moment'

class StopPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    history: React.PropTypes.object.isRequired

  componentDidMount: ->
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange

  onChange: (id) =>
    if !id or id == @props.params.stopId
      @forceUpdate()

  toggleFullscreenMap: =>
    @context.history.pushState null, "/pysakit/#{@props.params.stopId}/kartta"

  render: ->
    favourite = @context.getStore('FavouriteStopsStore').isFavourite(@props.params.stopId)
    addFavouriteStop = (e) =>
      e.stopPropagation()
      @context.executeAction FavouriteStopsAction.addFavouriteStop, @props.params.stopId

    <DefaultNavigation className="fullscreen stop">
      <StopCardHeader stop={@props.stop}
                      favourite={favourite}
                      addFavouriteStop={addFavouriteStop}
                      className="stop-page header"
                      headingStyle="h3"
                      infoIcon={true}/>
        <Map lat={@props.stop.lat}
             lon={@props.stop.lon}
             zoom={16}
             showStops=true
             hilightedStops=[@props.params.stopId]
             disableZoom=true>
          <div className="map-click-prevent-overlay" onClick={@toggleFullscreenMap}/>

          <Link to="/pysakit/#{@props.params.stopId}/kartta">
            <div className="fullscreen-toggle">
              <Icon img={'icon-icon_maximize'} className="cursor-pointer" />
            </div>
          </Link>

        </Map>
      <DepartureListContainer stoptimes={@props.stop.stoptimes}
                              className="stop-page below-map"
                              routeLinks={true}
                              infiniteScroll={true}
                              rowClasses="padding-normal border-bottom" />

    </DefaultNavigation>


module.exports = Relay.createContainer(StopPage,
  fragments: queries.StopPageFragments,
  initialVariables:
    date: moment().format("YYYYMMDD")
)
