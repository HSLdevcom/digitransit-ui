React              = require 'react'
SummaryNavigation  = require '../component/navigation/summary-navigation'
Map                = require '../component/map/map'
RouteSearchActions = require '../action/route-search-action'
SummaryRow         = require '../component/summary/summary-row'
FromToSearch       = require '../component/search/from-to-search'
isBrowser          = window?
Polyline           = if isBrowser then require 'react-leaflet/lib/Polyline' else null
Marker             = if isBrowser then require 'react-leaflet/lib/Marker' else null
CircleMarker       = if isBrowser then require 'react-leaflet/lib/CircleMarker' else null
polyUtil           = require 'polyline-encoded'
Icon               = require '../component/icon/icon'
getSelector        = require '../util/get-selector'

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
          color = if isBrowser then getSelector("." + leg.mode).style?.color else "#999" # TODO: Need a better way to do this
          leafletObjs.push <Polyline key={i + "," + j + leg.mode + "halo"} positions={polyUtil.decode leg.legGeometry.points} color="#fff" opacity=1 weight=5 />
          leafletObjs.push <Polyline key={i + "," + j + leg.mode} positions={polyUtil.decode leg.legGeometry.points} color={color or "#999"} opacity=1 weight=3 />
          if j != 0
            leafletObjs.push <CircleMarker key={i + "," + j + leg.mode + "circleHalo"} center={lat: leg.from.lat, lng: leg.from.lon} radius=3 color="#fff" opacity=1 />
            leafletObjs.push <CircleMarker key={i + "," + j + leg.mode + "circle"} center={lat: leg.from.lat, lng: leg.from.lon} radius=2 color={color or "#999"} fill={color or "#999"} opacity=1 fillOpacity=1 />

    <SummaryNavigation className="fullscreen">
      <Map className="summaryMap" leafletObjs={leafletObjs}>
        <FromToSearch params={@props.params}/>
      </Map>
      <div>{rows}</div>
    </SummaryNavigation>

module.exports = SummaryPage