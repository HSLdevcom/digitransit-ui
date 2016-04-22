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

TileContainer = require './tile-container'

class TileLayerContainer extends BaseTileLayer
  @contextTypes:
    #Needed for passing context to dynamic popup, maybe should be done in there?
    getStore: React.PropTypes.func.isRequired
    executeAction: React.PropTypes.func.isRequired
    intl: intl.intlShape.isRequired
    router: React.PropTypes.object.isRequired
    route: React.PropTypes.object.isRequired

  constructor: ->
    super
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
    props = omit @props, 'map'
    @leafletElement = new L.GridLayer(props)
    @leafletElement.createTile = @createTile
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
        <Popup
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
        <Popup
          options={popupOptions}
          latlng={@state.coords}
          ref="popup">
          <CityBikePopupWithContext station={@state.selectableTargets[0].feature.properties} coords={@state.coords} context={@context}/>
        </Popup>
    else if @state?.selectableTargets?.length > 1
      <Popup
        options={Object.assign {}, popupOptions, maxHeight: 220}
        latlng={@state.coords}
        ref="popup">
        <MarkerSelectPopupWithContext selectRow={@selectRow} options={@state.selectableTargets} context={@context}/>
      </Popup>
    else
      null


module.exports = TileLayerContainer
