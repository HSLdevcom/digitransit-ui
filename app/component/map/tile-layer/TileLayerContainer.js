import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import GridLayer from 'react-leaflet/es/GridLayer';
import SphericalMercator from '@mapbox/sphericalmercator';
import lodashFilter from 'lodash/filter';
import isEqual from 'lodash/isEqual';
import Popup from 'react-leaflet/es/Popup';
import { withLeaflet } from 'react-leaflet/es/context';

import TerminalMarkerPopup from '../popups/TerminalMarkerPopupContainer';
import StopMarkerPopup from '../popups/StopMarkerPopupContainer';
import MarkerSelectPopup from './MarkerSelectPopup';
import CityBikePopup from '../popups/CityBikePopupContainer';
import ParkAndRideHubPopup from '../popups/ParkAndRideHubPopupContainer';
import ParkAndRideFacilityPopup from '../popups/ParkAndRideFacilityPopupContainer';
import TicketSalesPopup from '../popups/TicketSalesPopup';
import LocationPopup from '../popups/LocationPopup';
import TileContainer from './TileContainer';
import { isFeatureLayerEnabled } from '../../../util/mapLayerUtils';
import MapLayerStore, { mapLayerShape } from '../../../store/MapLayerStore';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import getRelayEnvironment from '../../../util/getRelayEnvironment';
import { getClientBreakpoint } from '../../../util/withBreakpoint';

const initialState = {
  selectableTargets: undefined,
  coords: undefined,
  showSpinner: true,
};

// TODO eslint doesn't know that TileLayerContainer is a react component,
//      because it doesn't inherit it directly. This will force the detection
/** @extends React.Component */
class TileLayerContainer extends GridLayer {
  static propTypes = {
    tileSize: PropTypes.number.isRequired,
    zoomOffset: PropTypes.number.isRequired,
    disableMapTracking: PropTypes.func,
    mapLayers: mapLayerShape.isRequired,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        addLayer: PropTypes.func.isRequired,
        addEventParent: PropTypes.func.isRequired,
        closePopup: PropTypes.func.isRequired,
        removeEventParent: PropTypes.func.isRequired,
        _popup: PropTypes.shape({
          isOpen: PropTypes.func,
        }),
      }).isRequired,
    }).isRequired,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
    relayEnvironment: PropTypes.object.isRequired,
  };

  PopupOptions = {
    offset: [110, 16],
    minWidth: 260,
    maxWidth: 260,
    autoPanPaddingTopLeft: [5, 125],
    className: 'popup',
    ref: 'popup',
    onClose: () => this.setState({ ...initialState }),
    autoPan: false,
    onOpen: () => this.sendAnalytics(),
    relayEnvironment: PropTypes.object.isRequired,
  };

  merc = new SphericalMercator({
    size: this.props.tileSize || 256,
  });

  constructor(props, context) {
    super(props, context);

    // Required as it is not passed upwards through the whole inherittance chain
    this.context = context;
    this.state = {
      ...initialState,
      currentTime: context
        .getStore('TimeStore')
        .getCurrentTime()
        .unix(),
    };
    this.leafletElement.createTile = this.createTile;
  }

  componentDidMount() {
    super.componentDidMount();
    this.context.getStore('TimeStore').addChangeListener(this.onTimeChange);
    this.props.leaflet.map.addEventParent(this.leafletElement);
    this.leafletElement.on('click contextmenu', this.onClick);
  }

  componentDidUpdate(prevProps) {
    if (this.context.popupContainer != null) {
      this.context.popupContainer.openPopup();
    }
    if (!isEqual(prevProps.mapLayers, this.props.mapLayers)) {
      this.leafletElement.redraw();
    }
  }

  componentWillUnmount() {
    this.context.getStore('TimeStore').removeChangeListener(this.onTimeChange);
    this.leafletElement.off('click contextmenu', this.onClick);
  }

  onTimeChange = e => {
    let activeTiles;

    if (e.currentTime) {
      this.setState({ currentTime: e.currentTime.unix() });

      /* eslint-disable no-underscore-dangle */
      activeTiles = lodashFilter(
        this.leafletElement._tiles,
        tile => tile.active,
      );
      /* eslint-enable no-underscore-dangle */
      activeTiles.forEach(
        tile =>
          tile.el.layers &&
          tile.el.layers.forEach(layer => {
            if (layer.onTimeChange) {
              layer.onTimeChange();
            }
          }),
      );
    }
  };

  onClick = e => {
    /* eslint-disable no-underscore-dangle */
    Object.keys(this.leafletElement._tiles)
      .filter(key => this.leafletElement._tiles[key].active)
      .filter(key => this.leafletElement._keyToBounds(key).contains(e.latlng))
      .forEach(key =>
        this.leafletElement._tiles[key].el.onMapClick(
          e,
          this.merc.px(
            [e.latlng.lng, e.latlng.lat],
            Number(key.split(':')[2]) + this.props.zoomOffset,
          ),
        ),
      );
    /* eslint-enable no-underscore-dangle */
  };

  createTile = (tileCoords, done) => {
    const tile = new TileContainer(
      tileCoords,
      done,
      this.props,
      this.context.config,
      this.context.relayEnvironment,
    );

    tile.onSelectableTargetClicked = (
      selectableTargets,
      coords,
      forceOpen = false,
    ) => {
      const {
        disableMapTracking,
        leaflet: { map },
        mapLayers,
      } = this.props;
      const { coords: prevCoords } = this.state;
      const popup = map._popup; // eslint-disable-line no-underscore-dangle

      if (
        popup &&
        popup.isOpen() &&
        (!forceOpen || (coords && coords.equals(prevCoords)))
      ) {
        map.closePopup();
        return;
      }

      if (selectableTargets && disableMapTracking) {
        disableMapTracking(); // disable now that popup opens
      }

      this.setState({
        selectableTargets: selectableTargets.filter(target =>
          isFeatureLayerEnabled(
            target.feature,
            target.layer,
            mapLayers,
            this.context.config,
          ),
        ),
        coords,
      });
    };

    return tile.el;
  };

  selectRow = option => this.setState({ selectableTargets: [option] });

  /**
   * Send an analytics event on opening popup
   */
  sendAnalytics() {
    let name = null;
    let type = null;
    if (this.state.selectableTargets.length === 0) {
      return;
      // event for clicking somewhere else on the map will be handled in LocationPopup
    }
    if (this.state.selectableTargets.length === 1) {
      const target = this.state.selectableTargets[0];
      const { properties } = target.feature;
      name = target.layer;
      switch (name) {
        case 'ticketSales':
          type = properties.TYYPPI;
          break;
        case 'stop':
          ({ type } = properties);
          if (properties.stops) {
            type += '_TERMINAL';
          }
          break;
        default:
          break;
      }
    } else {
      name = 'multiple';
    }
    const pathPrefixMatch = window.location.pathname.match(/^\/([a-z]{2,})\//);
    const context = pathPrefixMatch ? pathPrefixMatch[1] : 'index';
    addAnalyticsEvent({
      action: 'SelectMapPoint',
      category: 'Map',
      name,
      type,
      source: context,
    });
  }

  render() {
    let popup = null;
    let contents;

    const breakpoint = getClientBreakpoint(); // DT-3470
    let showPopup = true; // DT-3470

    if (typeof this.state.selectableTargets !== 'undefined') {
      if (this.state.selectableTargets.length === 1) {
        let id;
        if (
          this.state.selectableTargets[0].layer === 'stop' &&
          this.state.selectableTargets[0].feature.properties.stops
        ) {
          if (
            !this.context.config.map.showStopMarkerPopupOnMobile &&
            breakpoint === 'small'
          ) {
            // DT-3470
            showPopup = false;
          }
          id = this.state.selectableTargets[0].feature.properties.gtfsId;
          contents = (
            <TerminalMarkerPopup
              terminalId={id}
              currentTime={this.state.currentTime}
              context={this.context}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'stop') {
          if (
            !this.context.config.map.showStopMarkerPopupOnMobile &&
            breakpoint === 'small'
          ) {
            // DT-3470
            showPopup = false;
          }
          id = this.state.selectableTargets[0].feature.properties.gtfsId;
          contents = (
            <StopMarkerPopup
              stopId={id}
              currentTime={this.state.currentTime}
              context={this.context}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'citybike') {
          ({ id } = this.state.selectableTargets[0].feature.properties);
          contents = <CityBikePopup stationId={id} context={this.context} />;
        } else if (
          this.state.selectableTargets[0].layer === 'parkAndRide' &&
          this.state.selectableTargets[0].feature.properties.facilityIds
        ) {
          id = this.state.selectableTargets[0].feature.properties.facilityIds;
          contents = (
            <ParkAndRideHubPopup
              ids={JSON.parse(id).map(i => i.toString())}
              name={
                JSON.parse(
                  this.state.selectableTargets[0].feature.properties.name,
                )[this.context.intl.locale]
              }
              coords={this.state.coords}
              context={this.context}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'parkAndRide') {
          ({ id } = this.state.selectableTargets[0].feature);
          contents = (
            <ParkAndRideFacilityPopup
              id={id.toString()}
              name={
                JSON.parse(
                  this.state.selectableTargets[0].feature.properties.name,
                )[this.context.intl.locale]
              }
              coords={this.state.coords}
              context={this.context}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'ticketSales') {
          id = this.state.selectableTargets[0].feature.properties.FID;
          contents = (
            <TicketSalesPopup
              {...this.state.selectableTargets[0].feature.properties}
            />
          );
        }
        popup = (
          <Popup {...this.PopupOptions} key={id} position={this.state.coords}>
            {contents}
          </Popup>
        );
      } else if (this.state.selectableTargets.length > 1) {
        if (
          !this.context.config.map.showStopMarkerPopupOnMobile &&
          breakpoint === 'small'
        ) {
          // DT-3470
          showPopup = false;
        }
        popup = (
          <Popup
            key={this.state.coords.toString()}
            {...this.PopupOptions}
            maxHeight={220}
            position={this.state.coords}
          >
            <MarkerSelectPopup
              selectRow={this.selectRow}
              options={this.state.selectableTargets}
              location={this.state.coords}
            />
          </Popup>
        );
      } else if (this.state.selectableTargets.length === 0) {
        if (
          !this.context.config.map.showStopMarkerPopupOnMobile &&
          breakpoint === 'small'
        ) {
          // DT-3470
          showPopup = false;
        }
        popup = (
          <Popup
            key={this.state.coords.toString()}
            {...this.PopupOptions}
            maxHeight={220}
            position={this.state.coords}
          >
            <LocationPopup
              name="" // TODO: fill in name from reverse geocoding, possibly in a container.
              lat={this.state.coords.lat}
              lon={this.state.coords.lng}
            />
          </Popup>
        );
      }
    }

    return showPopup ? popup : null;
  }
}

const connectedComponent = withLeaflet(
  getRelayEnvironment(
    connectToStores(TileLayerContainer, [MapLayerStore], context => ({
      mapLayers: context.getStore(MapLayerStore).getMapLayers(),
    })),
  ),
);

export { connectedComponent as default, TileLayerContainer as Component };
