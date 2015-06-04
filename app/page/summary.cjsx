React              = require 'react'
SummaryNavigation  = require '../component/navigation/summary-navigation'
Map                = require '../component/map/map'
RouteSearchActions = require '../action/route-search-action'
SummaryRow         = require '../component/summary/summary-row'
FromToSearch       = require '../component/search/from-to-search'
ItineraryLine      = require '../component/map/itinerary-line'

class SummaryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @loadAction: RouteSearchActions.routeSearchRequest

  componentDidMount: ->
    @context.getStore('RouteSearchStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('RouteSearchStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: ->
    rows = []
    leafletObjs = []

    if @context.getStore('RouteSearchStore').getData().plan
      for data, i in @context.getStore('RouteSearchStore').getData().plan.itineraries
        rows.push <SummaryRow key={i} hash={i} params={@props.params} data={data}/>
        leafletObjs.push <ItineraryLine legs={data.legs} showFromToMarkers={i==0}/>

    <SummaryNavigation className="fullscreen">
      <Map ref="map" className="summaryMap" leafletObjs={leafletObjs} fitBounds={true} from={@context.getStore('RouteSearchStore').getData().plan.from} to={@context.getStore('RouteSearchStore').getData().plan.to} padding={[0, 110]}>
        <FromToSearch params={@props.params}/>
      </Map>
      <div>{rows}</div>
    </SummaryNavigation>

module.exports = SummaryPage