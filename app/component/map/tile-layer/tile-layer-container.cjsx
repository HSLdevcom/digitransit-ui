React         = require 'react'
Relay         = require 'react-relay'
queries       = require '../../../queries'
Popup         = require '../dynamic-popup'
intl          = require 'react-intl'
BaseTileLayer = require('react-leaflet/lib/BaseTileLayer').default
omit          = require 'lodash/omit'
provideContext = require 'fluxible-addons-react/provideContext'
StopMarkerPopup = require '../popups/stop-marker-popup'
MarkerSelectPopup = require './marker-select-popup'
CityBikePopup = require '../popups/city-bike-popup'
SphericalMercator = require 'sphericalmercator'

TileContainer = require './tile-container'

class TileLayerContainer extends BaseTileLayer
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    router: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  constructor: (props) ->
    super
    @merc = new SphericalMercator({size: (props.tileSize or 256)})
    @state =
      stops: undefined
      coords: undefined

  createTile: (coords, done) =>
    tile = new TileContainer(coords, done, @props)
    tile.onSelectableTargetClicked = (selectableTargets, coords) =>
      if @props.disableMapTracking
        @props.disableMapTracking()
      @setState
        selectableTargets: selectableTargets
        coords: coords
    tile.el

  componentDidMount: () ->
    Layer = L.GridLayer.extend({createTile: @createTile})
    @leafletElement = new Layer(omit @props, 'map')
    # Propagate events from map to this layer
    @props.map.addEventParent @leafletElement
    @leafletElement.on 'click', (e) =>
      Object.keys(@leafletElement._tiles)
        .filter((key) =>  @leafletElement._tiles[key].active)
        .filter((key) => @leafletElement._keyToBounds(key).contains(e.latlng))
        .forEach((key) => @leafletElement._tiles[key].el.onMapClick(e, @merc.px([e.latlng.lng, e.latlng.lat], Number(key.split(':')[2]) + @props.zoomOffset )))
    super

  componentDidUpdate: ->
    @refs.popup?._leafletElement.openOn(@props.map)

  selectRow: (option) =>
    @setState
      selectableTargets: [option]

  render: () ->
    StopMarkerPopupWithContext = provideContext StopMarkerPopup,
      intl: intl.intlShape.isRequired
      router: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired

    MarkerSelectPopupWithContext = provideContext MarkerSelectPopup,
      intl: intl.intlShape.isRequired
      router: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired

    CityBikePopupWithContext = provideContext CityBikePopup,
      intl: intl.intlShape.isRequired
      router: React.PropTypes.object.isRequired
      route: React.PropTypes.object.isRequired
      getStore: React.PropTypes.func.isRequired

    #TODO: cjsx doesn't like objects withing nested elements
    loadingPopupStyle = height: 150

    popupOptions =
      offset: [106, 3]
      closeButton: false
      maxWidth: 250
      minWidth: 250
      autoPanPaddingTopLeft: [5, 125]
      className: "popup"

    if @state?.selectableTargets?.length == 1
      if @state.selectableTargets[0].layer == "stop"
        popup = <Popup
          options={popupOptions}
          latlng={@state.coords}
          ref="popup">
          <Relay.RootContainer
            Component={StopMarkerPopup}
            route={new queries.StopRoute(
              stopId: @state.selectableTargets[0].feature.properties.gtfsId
              date: @context.getStore('TimeStore').getCurrentTime().format("YYYYMMDD")
            )}
            renderLoading={() => <div className="card" style=loadingPopupStyle><div className="spinner-loader"/></div>}
            renderFetched={(data) => <StopMarkerPopupWithContext {... data} context={@context}/>}/>
        </Popup>
      else
        popup = <Popup
          options={popupOptions}
          latlng={@state.coords}
          ref="popup">
          <Relay.RootContainer
            Component={CityBikePopup}
            route={new queries.CityBikeRoute(
              stationId: @state.selectableTargets[0].feature.properties.id
            )}
            renderLoading={() => <div className="card" style=loadingPopupStyle><div className="spinner-loader"/></div>}
            renderFetched={(data) => <CityBikePopupWithContext {... data} context={@context}/>}/>
        </Popup>
    else if @state?.selectableTargets?.length > 1
      popup = <Popup
        options={Object.assign {}, popupOptions, maxHeight: 220}
        latlng={@state.coords}
        ref="popup">
        <MarkerSelectPopupWithContext selectRow={@selectRow} options={@state.selectableTargets} context={@context}/>
      </Popup>
    else
      popup = false

    <div style={display: 'none'}>
      {popup}
    </div>


module.exports = TileLayerContainer
