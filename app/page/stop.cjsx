React              = require 'react'
Relay              = require 'react-relay'
Helmet             = require 'react-helmet'
queries            = require '../queries'
DefaultNavigation  = require('../component/navigation/DefaultNavigation').default
Map                = require('../component/map/Map').default
DepartureListContainer = require '../component/departure/departure-list-container'
StopCardHeader     = require '../component/stop-cards/stop-card-header'
FavouriteStopsAction = require '../action/favourite-stops-action'
Link               = require 'react-router/lib/Link'
Icon               = require '../component/icon/icon'
moment             = require 'moment'
intl               = require 'react-intl'

class StopPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    router: React.PropTypes.object.isRequired
    intl: intl.intlShape.isRequired

  componentWillMount: ->
    @props.relay.setVariables
      date: @context.getStore('TimeStore').getCurrentTime().format('YYYYMMDD')

  componentDidMount: ->
    @context.getStore('FavouriteStopsStore').addChangeListener @onChange
    @context.getStore('TimeStore').addChangeListener @onTimeChange

  componentWillUnmount: ->
    @context.getStore('FavouriteStopsStore').removeChangeListener @onChange
    @context.getStore('TimeStore').removeChangeListener @onTimeChange

  onChange: (id) =>
    if !id or id == @props.params.stopId
      @forceUpdate()

  onTimeChange: (e) =>
    if e.currentTime
      date = @context.getStore('TimeStore').getCurrentTime().format('YYYYMMDD')
      @props.relay.setVariables({date: date}, () => @forceUpdate())

  toggleFullscreenMap: =>
    @context.router.push "/pysakit/#{@props.params.stopId}/kartta"

  render: ->
    favourite = @context.getStore('FavouriteStopsStore').isFavourite(@props.params.stopId)
    addFavouriteStop = (e) =>
      e.stopPropagation()
      @context.executeAction FavouriteStopsAction.addFavouriteStop, @props.params.stopId

    params =
        stop_name: @props.stop.name
        stop_code: @props.stop.code

    title = @context.intl.formatMessage {id: 'stop-page.title', defaultMessage: 'Stop {stop_name} - {stop_code}'}, params
    meta =
      title: title
      meta: [
        {name: 'description', content: @context.intl.formatMessage {id: 'stop-page.description', defaultMessage: 'Stop {stop_name} - {stop_code}'}, params}
      ]

    <DefaultNavigation className="fullscreen stop" title={title}>
      <Helmet {...meta} />
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
                              className="stop-page below-map momentum-scroll"
                              routeLinks={true}
                              infiniteScroll={true}
                              rowClasses="padding-normal border-bottom" />

    </DefaultNavigation>


module.exports = Relay.createContainer(StopPage,
  fragments: queries.StopPageFragments,
  initialVariables:
    date: moment().format('YYYYMMDD') # will be reset later from TimeStore
)
