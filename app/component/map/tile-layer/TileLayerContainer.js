import connectToStores from 'fluxible-addons-react/connectToStores';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { intlShape } from 'react-intl';
import GridLayer from 'react-leaflet/es/GridLayer';
import SphericalMercator from '@mapbox/sphericalmercator';
import lodashFilter from 'lodash/filter';
import isEqual from 'lodash/isEqual';
import Popup from 'react-leaflet/es/Popup';
import { withLeaflet } from 'react-leaflet/es/context';

import StopRoute from '../../../route/StopRoute';
import TerminalRoute from '../../../route/TerminalRoute';
import CityBikeRoute from '../../../route/CityBikeRoute';
import StopMarkerPopup from '../popups/StopMarkerPopup';
import MarkerSelectPopup from './MarkerSelectPopup';
import CityBikePopup from '../popups/CityBikePopup';
import ParkAndRideHubPopup from '../popups/ParkAndRideHubPopup';
import ParkAndRideFacilityPopup from '../popups/ParkAndRideFacilityPopup';
import ParkAndRideHubRoute from '../../../route/ParkAndRideHubRoute';
import ParkAndRideFacilityRoute from '../../../route/ParkAndRideFacilityRoute';
import TicketSalesPopup from '../popups/TicketSalesPopup';
import LocationPopup from '../popups/LocationPopup';
import TileContainer from './TileContainer';
import Loading from '../../Loading';
import { isFeatureLayerEnabled } from '../../../util/mapLayerUtils';
import MapLayerStore, { mapLayerShape } from '../../../store/MapLayerStore';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';

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
      }).isRequired,
    }).isRequired,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
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
      this.setState({ currentTime: e.currentTime.unix(), showSpinner: false });

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
        showSpinner: true,
      });
    };

    return tile.el;
  };

  selectRow = option =>
    this.setState({ selectableTargets: [option], showSpinner: true });

  loadingPopup = () => (
    <div className="card" style={{ height: '12rem' }}>
      <Loading />
    </div>
  );

  getStopContent = (id, target) => (
    <Relay.RootContainer
      Component={StopMarkerPopup}
      route={
        target.feature.properties.stops
          ? new TerminalRoute({
              terminalId: id,
              currentTime: this.state.currentTime,
            })
          : new StopRoute({
              stopId: id,
              currentTime: this.state.currentTime,
            })
      }
      renderLoading={this.state.showSpinner ? this.loadingPopup : undefined}
      renderFetched={data => <StopMarkerPopup {...data} />}
    />
  );

  getCitybikeContent = id => (
    <Relay.RootContainer
      Component={CityBikePopup}
      forceFetch
      route={
        new CityBikeRoute({
          stationId: id,
        })
      }
      renderLoading={this.loadingPopup}
      renderFetched={data => <CityBikePopup {...data} />}
    />
  );

  getParkAndRideWithIdsContent = (id, target) => (
    <Relay.RootContainer
      Component={ParkAndRideHubPopup}
      forceFetch
      route={new ParkAndRideHubRoute({ stationIds: JSON.parse(id) })}
      renderLoading={this.loadingPopup}
      renderFetched={data => (
        <ParkAndRideHubPopup
          name={
            JSON.parse(target.feature.properties.name)[this.context.intl.locale]
          }
          lat={this.state.coords.lat}
          lon={this.state.coords.lng}
          {...data}
        />
      )}
    />
  );

  getParkAndRideContent = (id, target) => (
    <Relay.RootContainer
      Component={ParkAndRideFacilityPopup}
      forceFetch
      route={new ParkAndRideFacilityRoute({ id })}
      renderLoading={this.loadingPopup}
      renderFetched={data => (
        <ParkAndRideFacilityPopup
          name={
            JSON.parse(target.feature.properties.name)[this.context.intl.locale]
          }
          lat={this.state.coords.lat}
          lon={this.state.coords.lng}
          {...data}
        />
      )}
    />
  );

  showOneTargetPopup = () => {
    const target = this.state.selectableTargets[0];
    let id;
    let contents;
    if (target.layer === 'stop') {
      id = target.feature.properties.gtfsId;
      contents = this.getStopContent(id, target);
    } else if (target.layer === 'citybike') {
      ({ id } = target.feature.properties);
      contents = this.getCitybikeContent(id);
    } else if (
      target.layer === 'parkAndRide' &&
      target.feature.properties.facilityIds
    ) {
      id = target.feature.properties.facilityIds;
      contents = this.getParkAndRideWithIdsContent(id, target);
    } else if (target.layer === 'parkAndRide') {
      ({ id } = target.feature);
      contents = this.getParkAndRideContent(id, target);
    } else if (target.layer === 'ticketSales') {
      id = target.feature.properties.FID;
      contents = <TicketSalesPopup {...target.feature.properties} />;
    }
    return (
      <Popup {...this.PopupOptions} key={id} position={this.state.coords}>
        {contents}
      </Popup>
    );
  };

  showMultipleTargetsPopup = () => (
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

  showLocationPopup = () => (
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
          type = properties.Tyyppi;
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

    if (typeof this.state.selectableTargets !== 'undefined') {
      const numOfTargets = this.state.selectableTargets.length;
      if (numOfTargets === 1) {
        popup = this.showOneTargetPopup();
      } else if (numOfTargets > 1) {
        popup = this.showMultipleTargetsPopup();
      } else if (numOfTargets === 0) {
        popup = this.showLocationPopup();
      }
    }

    return popup;
  }
}

const connectedComponent = withLeaflet(
  connectToStores(TileLayerContainer, [MapLayerStore], context => ({
    mapLayers: context.getStore(MapLayerStore).getMapLayers(),
  })),
);

export { connectedComponent as default, TileLayerContainer as Component };
