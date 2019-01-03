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
        removeEventParent: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

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
      this.props.leaflet.map.removeEventParent(this.leafletElement);
      this.leafletElement.remove();
      this.leafletElement = this.createLeafletElement(this.props);
      this.props.leaflet.map.addLayer(this.leafletElement);
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

  onPopupclose = () => this.setState(initialState);

  PopupOptions = {
    offset: [110, 16],
    minWidth: 260,
    maxWidth: 260,
    autoPanPaddingTopLeft: [5, 125],
    className: 'popup',
    ref: 'popup',
    onClose: this.onPopupclose,
    autoPan: false,
  };

  merc = new SphericalMercator({
    size: this.props.tileSize || 256,
  });

  createTile = (tileCoords, done) => {
    const tile = new TileContainer(
      tileCoords,
      done,
      this.props,
      this.context.config,
    );

    tile.onSelectableTargetClicked = (selectableTargets, coords) => {
      if (selectableTargets && this.props.disableMapTracking) {
        this.props.disableMapTracking(); // disable now that popup opens
      }

      this.setState({
        selectableTargets: selectableTargets.filter(target =>
          isFeatureLayerEnabled(
            target.feature,
            target.layer,
            this.props.mapLayers,
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

  render() {
    let popup = null;
    let contents;

    const loadingPopup = () => (
      <div className="card" style={{ height: '12rem' }}>
        <Loading />
      </div>
    );

    if (typeof this.state.selectableTargets !== 'undefined') {
      if (this.state.selectableTargets.length === 1) {
        let id;
        if (this.state.selectableTargets[0].layer === 'stop') {
          id = this.state.selectableTargets[0].feature.properties.gtfsId;
          contents = (
            <Relay.RootContainer
              Component={StopMarkerPopup}
              route={
                this.state.selectableTargets[0].feature.properties.stops
                  ? new TerminalRoute({
                      terminalId: id,
                      currentTime: this.state.currentTime,
                    })
                  : new StopRoute({
                      stopId: id,
                      currentTime: this.state.currentTime,
                    })
              }
              renderLoading={this.state.showSpinner ? loadingPopup : undefined}
              renderFetched={data => <StopMarkerPopup {...data} />}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'citybike') {
          ({ id } = this.state.selectableTargets[0].feature.properties);
          contents = (
            <Relay.RootContainer
              Component={CityBikePopup}
              forceFetch
              route={
                new CityBikeRoute({
                  stationId: id,
                })
              }
              renderLoading={loadingPopup}
              renderFetched={data => <CityBikePopup {...data} />}
            />
          );
        } else if (
          this.state.selectableTargets[0].layer === 'parkAndRide' &&
          this.state.selectableTargets[0].feature.properties.facilityIds
        ) {
          id = this.state.selectableTargets[0].feature.properties.facilityIds;
          contents = (
            <Relay.RootContainer
              Component={ParkAndRideHubPopup}
              forceFetch
              route={new ParkAndRideHubRoute({ stationIds: JSON.parse(id) })}
              renderLoading={loadingPopup}
              renderFetched={data => (
                <ParkAndRideHubPopup
                  name={
                    JSON.parse(
                      this.state.selectableTargets[0].feature.properties.name,
                    )[this.context.intl.locale]
                  }
                  lat={this.state.coords.lat}
                  lon={this.state.coords.lng}
                  {...data}
                />
              )}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'parkAndRide') {
          ({ id } = this.state.selectableTargets[0].feature);
          contents = (
            <Relay.RootContainer
              Component={ParkAndRideFacilityPopup}
              forceFetch
              route={new ParkAndRideFacilityRoute({ id })}
              renderLoading={loadingPopup}
              renderFetched={data => (
                <ParkAndRideFacilityPopup
                  name={
                    JSON.parse(
                      this.state.selectableTargets[0].feature.properties.name,
                    )[this.context.intl.locale]
                  }
                  lat={this.state.coords.lat}
                  lon={this.state.coords.lng}
                  {...data}
                />
              )}
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
            />
          </Popup>
        );
      } else if (this.state.selectableTargets.length === 0) {
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

    return popup;
  }
}

export default withLeaflet(
  connectToStores(TileLayerContainer, [MapLayerStore], context => ({
    mapLayers: context.getStore(MapLayerStore).getMapLayers(),
  })),
);
