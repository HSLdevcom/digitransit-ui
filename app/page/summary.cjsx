React              = require 'react'
DefaultNavigation  = require '../component/navigation/default-navigation'
Map                = require '../component/map/map'
RouteSearchActions = require '../action/route-search-action'
SummaryRow         = require '../component/summary/summary-row'
FromToSearch       = require '../component/search/from-to-search'
isBrowser          = window?
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null
Marker             = if isBrowser then require 'react-leaflet/lib/Marker' else null
polyUtil           = require('polyline-encoded');
Icon               = require '../component/icon/icon.cjsx'


class SummaryPage extends React.Component
  @contextTypes:
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired

  @loadAction: RouteSearchActions.routeSearchRequest

  @fromIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'from') else null

  @toIcon: if isBrowser then L.divIcon(html: React.renderToString(React.createElement(Icon, img: 'icon-icon_mapMarker-point')), className: 'to') else null

  componentDidMount: -> 
    @context.getStore('RouteSearchStore').addChangeListener @onChange

  componentWillUnmount: ->
    @context.getStore('RouteSearchStore').removeChangeListener @onChange

  onChange: =>
    @forceUpdate()

  render: ->
    rows = []
    leafletObjs = []
    leafletObjs.push <Marker key="from" position={@context.getStore('RouteSearchStore').getData().plan.from} icon={SummaryPage.fromIcon}/>
    leafletObjs.push <Marker key="to" position={@context.getStore('RouteSearchStore').getData().plan.to} icon={SummaryPage.toIcon}/>

    if @context.getStore('RouteSearchStore').getData().plan
      for data, i in @context.getStore('RouteSearchStore').getData().plan.itineraries
        rows.push <SummaryRow key={i} hash={i} params={@props.params} data={data}/>
        for leg, j in data.legs
          leafletObjs.push <Polyline key={i + "," + j} positions={polyUtil.decode leg.legGeometry.points} color="#999"/>

    <DefaultNavigation className="fullscreen">
      <Map className="summaryMap" leafletObjs={leafletObjs}>
        <FromToSearch params={@props.params}/>
      </Map>
      <div>{rows}</div>
    </DefaultNavigation>

module.exports = SummaryPage