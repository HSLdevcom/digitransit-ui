import PropTypes from 'prop-types';
import React from 'react';
import Popup from 'react-leaflet/lib/Popup';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import GridLayer from 'react-leaflet/lib/GridLayer';
import provideContext from 'fluxible-addons-react/provideContext';
import SphericalMercator from '@mapbox/sphericalmercator';
import lodashFilter from 'lodash/filter';
import L from 'leaflet';

import TerminalMarkerPopup from '../popups/TerminalMarkerPopupContainer';
import StopMarkerPopup from '../popups/StopMarkerPopupContainer';
import MarkerSelectPopup from './MarkerSelectPopup';
import CityBikePopup from '../popups/CityBikePopupContainer';
import ParkAndRideHubPopup from '../popups/ParkAndRideHubPopupContainer';
import ParkAndRideFacilityPopup from '../popups/ParkAndRideFacilityPopupContainer';
import TicketSalesPopup from '../popups/TicketSalesPopup';
import LocationPopup from '../popups/LocationPopup';
import TileContainer from './TileContainer';

const contextTypes = {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  location: locationShape.isRequired,
  route: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
};

const StopMarkerPopupWithContext = provideContext(
  StopMarkerPopup,
  contextTypes,
);

const TerminalMarkerPopupWithContext = provideContext(
  TerminalMarkerPopup,
  contextTypes,
);

const MarkerSelectPopupWithContext = provideContext(
  MarkerSelectPopup,
  contextTypes,
);

const CityBikePopupWithContext = provideContext(CityBikePopup, contextTypes);

const ParkAndRideHubPopupWithContext = provideContext(
  ParkAndRideHubPopup,
  contextTypes,
);

const ParkAndRideFacilityPopupWithContext = provideContext(
  ParkAndRideFacilityPopup,
  contextTypes,
);

const TicketSalesPopupWithContext = provideContext(
  TicketSalesPopup,
  contextTypes,
);

const LocationPopupWithContext = provideContext(LocationPopup, contextTypes);

const PopupOptions = {
  offset: [110, 16],
  closeButton: false,
  minWidth: 260,
  maxWidth: 260,
  autoPanPaddingTopLeft: [5, 125],
  className: 'popup',
  ref: 'popup',
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
    stops: undefined,
    coords: undefined,
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
      });
    };

    return tile.el;
  };

  selectRow = option => this.setState({ selectableTargets: [option] });

  render() {
    let popup = null;
    let contents;

    if (typeof this.state.selectableTargets !== 'undefined') {
      if (this.state.selectableTargets.length === 1) {
        let id;
        const currentTime = this.context
          .getStore('TimeStore')
          .getCurrentTime()
          .unix();
        if (
          this.state.selectableTargets[0].layer === 'stop' &&
          this.state.selectableTargets[0].feature.properties.stops
        ) {
          id = this.state.selectableTargets[0].feature.properties.gtfsId;
          contents = (
            <TerminalMarkerPopupWithContext
              terminalId={id}
              currentTime={currentTime}
              context={this.context}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'stop') {
          id = this.state.selectableTargets[0].feature.properties.gtfsId;
          contents = (
            <StopMarkerPopupWithContext
              stopId={id}
              currentTime={currentTime}
              context={this.context}
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'citybike') {
          id = this.state.selectableTargets[0].feature.properties.id;
          contents = (
            <CityBikePopupWithContext stationId={id} context={this.context} />
          );
        } else if (
          this.state.selectableTargets[0].layer === 'parkAndRide' &&
          this.state.selectableTargets[0].feature.properties.facilityIds
        ) {
          id = this.state.selectableTargets[0].feature.properties.facilityIds;
          contents = (
            <ParkAndRideHubPopupWithContext
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
          id = this.state.selectableTargets[0].feature.id;
          contents = (
            <ParkAndRideFacilityPopupWithContext
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
            <TicketSalesPopupWithContext
              {...this.state.selectableTargets[0].feature.properties}
              context={this.context}
            />
          );
        }
        popup = (
          <Popup {...PopupOptions} key={id} position={this.state.coords}>
            {contents}
          </Popup>
        );
      } else if (this.state.selectableTargets.length > 1) {
        popup = (
          <Popup
            key={this.state.coords.toString()}
            {...PopupOptions}
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
            {...PopupOptions}
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
