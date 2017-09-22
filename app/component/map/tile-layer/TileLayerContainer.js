import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import Popup from 'react-leaflet/lib/Popup';
import { intlShape } from 'react-intl';
import GridLayer from 'react-leaflet/lib/GridLayer';
import provideContext from 'fluxible-addons-react/provideContext';
import SphericalMercator from '@mapbox/sphericalmercator';
import lodashFilter from 'lodash/filter';
import L from 'leaflet';

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

const StopMarkerPopupWithContext = provideContext(StopMarkerPopup, {
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
});

const MarkerSelectPopupWithContext = provideContext(MarkerSelectPopup, {
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
});

const CityBikePopupWithContext = provideContext(CityBikePopup, {
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
});

const ParkAndRideHubPopupWithContext = provideContext(ParkAndRideHubPopup, {
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
});

const ParkAndRideFacilityPopupWithContext = provideContext(
  ParkAndRideFacilityPopup,
  {
    intl: intlShape.isRequired,
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    getStore: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
  },
);

const TicketSalesPopupWithContext = provideContext(TicketSalesPopup, {
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  getStore: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
});

const LocationPopupWithContext = provideContext(LocationPopup, {
  intl: intlShape.isRequired,
  router: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
});

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
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
    map: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    route: PropTypes.object.isRequired,
    config: PropTypes.object.isRequired,
  };

  state = {
    ...initialState,
    currentTime: this.context.getStore('TimeStore').getCurrentTime().unix(),
  };

  componentWillMount() {
    super.componentWillMount();
    this.context.getStore('TimeStore').addChangeListener(this.onTimeChange);
  }

  componentDidUpdate() {
    if (this.context.popupContainer != null) {
      this.context.popupContainer.openPopup();
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
    closeButton: false,
    minWidth: 260,
    maxWidth: 260,
    autoPanPaddingTopLeft: [5, 125],
    className: 'popup',
    ref: 'popup',
    onClose: this.onPopupclose,
  };

  createLeafletElement(props) {
    const Layer = L.GridLayer.extend({ createTile: this.createTile });
    const leafletElement = new Layer(this.getOptions(props));

    this.context.map.addEventParent(leafletElement);
    leafletElement.on('click contextmenu', this.onClick);

    return leafletElement;
  }

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
        selectableTargets,
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

    const loadingPopup = () =>
      <div className="card" style={{ height: '12rem' }}>
        <Loading />
      </div>;

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
              renderFetched={data =>
                <StopMarkerPopupWithContext {...data} context={this.context} />}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'citybike') {
          id = this.state.selectableTargets[0].feature.properties.id;
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
              renderFetched={data =>
                <CityBikePopupWithContext {...data} context={this.context} />}
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
              renderFetched={data =>
                <ParkAndRideHubPopupWithContext
                  name={
                    JSON.parse(
                      this.state.selectableTargets[0].feature.properties.name,
                    )[this.context.intl.locale]
                  }
                  lat={this.state.coords.lat}
                  lon={this.state.coords.lng}
                  {...data}
                  context={this.context}
                />}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'parkAndRide') {
          id = this.state.selectableTargets[0].feature.id;
          contents = (
            <Relay.RootContainer
              Component={ParkAndRideFacilityPopup}
              forceFetch
              route={new ParkAndRideFacilityRoute({ id })}
              renderLoading={loadingPopup}
              renderFetched={data =>
                <ParkAndRideFacilityPopupWithContext
                  name={
                    JSON.parse(
                      this.state.selectableTargets[0].feature.properties.name,
                    )[this.context.intl.locale]
                  }
                  lat={this.state.coords.lat}
                  lon={this.state.coords.lng}
                  {...data}
                  context={this.context}
                />}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'ticketSales') {
          id = this.state.selectableTargets[0].feature.properties.FID;
          contents = (
            <TicketSalesPopupWithContext
              {...this.state.selectableTargets[0].feature.properties}
              context={this.context}
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
            <MarkerSelectPopupWithContext
              selectRow={this.selectRow}
              options={this.state.selectableTargets}
              context={this.context}
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
            <LocationPopupWithContext
              name={''} // TODO: fill in name from reverse geocoding, possibly in a container.
              lat={this.state.coords.lat}
              lon={this.state.coords.lng}
              context={this.context}
            />
          </Popup>
        );
      }
    }

    return popup;
  }
}

export default TileLayerContainer;
