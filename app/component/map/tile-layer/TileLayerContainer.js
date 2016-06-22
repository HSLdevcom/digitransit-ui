import React from 'react';
import Relay from 'react-relay';
import StopRoute from '../../../route/StopRoute';
import CityBikeRoute from '../../../route/CityBikeRoute';
import Popup from '../Popup';
import intl from 'react-intl';
import BaseTileLayer from 'react-leaflet/lib/BaseTileLayer';
import omit from 'lodash/omit';
import provideContext from 'fluxible-addons-react/provideContext';
import StopMarkerPopup from '../popups/stop-marker-popup';
import MarkerSelectPopup from './MarkerSelectPopup';
import CityBikePopup from '../popups/city-bike-popup';
import SphericalMercator from 'sphericalmercator';
import lodashFilter from 'lodash/filter';
import TileContainer from './TileContainer';
import L from 'leaflet';

const StopMarkerPopupWithContext = provideContext(StopMarkerPopup, {
  intl: intl.intlShape.isRequired,
  router: React.PropTypes.object.isRequired,
  route: React.PropTypes.object.isRequired,
});

const MarkerSelectPopupWithContext = provideContext(MarkerSelectPopup, {
  intl: intl.intlShape.isRequired,
  router: React.PropTypes.object.isRequired,
  route: React.PropTypes.object.isRequired,
});

const CityBikePopupWithContext = provideContext(CityBikePopup, {
  intl: intl.intlShape.isRequired,
  router: React.PropTypes.object.isRequired,
  route: React.PropTypes.object.isRequired,
  getStore: React.PropTypes.func.isRequired,
});

// TODO eslint doesn't know that TileLayerContainer is a react component,
//      because it doesn't inherit it directly. This will force the detection
//      once eslint-plugin-react has a new release (https://github.com/yannickcr/eslint-plugin-react/pull/513)
/** @extends React.Component */
class TileLayerContainer extends BaseTileLayer {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intl.intlShape.isRequired,
    router: React.PropTypes.object.isRequired,
    route: React.PropTypes.object.isRequired,
  };

  merc = new SphericalMercator({
    size: this.props.tileSize || 256,
  });

  state = {
    stops: undefined,
    coords: undefined,
  };

  createTile = (tileCoords, done) => {
    const tile = new TileContainer(tileCoords, done, this.props);

    tile.onSelectableTargetClicked = (selectableTargets, coords) => {
      if (this.props.disableMapTracking) {
        this.props.disableMapTracking();
      }

      this.setState({
        selectableTargets,
        coords,
      });
    };

    return tile.el;
  }

  onTimeChange = (e) => {
    let activeTiles;

    if (e.currentTime) {
      /* eslint-disable no-underscore-dangle */
      activeTiles = lodashFilter(this.leafletElement._tiles, tile => tile.active);
      /* eslint-enable no-underscore-dangle */

      activeTiles.forEach(tile => {
        tile.el.layers.forEach(layer => {
          if (layer.onTimeChange) {
            layer.onTimeChange();
          }
        });
      });
    }
  }

  componentDidMount() {
    this.context.getStore('TimeStore').addChangeListener(this.onTimeChange);

    const Layer = L.GridLayer.extend({ createTile: this.createTile });

    this.leafletElement = new Layer(omit(this.props, 'map'));
    this.props.map.addEventParent(this.leafletElement);

    /* eslint-disable no-underscore-dangle */
    this.leafletElement.on('click', e => {
      Object.keys(this.leafletElement._tiles)
        .filter(key => this.leafletElement._tiles[key].active)
        .filter(key => this.leafletElement._keyToBounds(key).contains(e.latlng))
        .forEach(key => this.leafletElement._tiles[key].el.onMapClick(
          e,
          this.merc.px([e.latlng.lng, e.latlng.lat],
          Number(key.split(':')[2]) + this.props.zoomOffset)
        )
      );
    });
    /* eslint-enable no-underscore-dangle */
    super.componentDidMount(...this.props);
  }

  componentWillUnmount() {
    this.context.getStore('TimeStore').removeChangeListener(this.onTimeChange);
  }

  componentDidUpdate() {
    if (this.refs.popup != null) {
      this.refs.popup.leafletElement.openOn(this.props.map);
    }
  }

  selectRow = (option) => this.setState({ selectableTargets: [option] })

  render() {
    let popup = null;
    let contents;

    const loadingPopup = () =>
      <div className="card" style={{ height: 150 }}>
        <div className="spinner-loader" />
      </div>;

    if (typeof this.state.selectableTargets !== 'undefined') {
      if (this.state.selectableTargets.length === 1) {
        let id;
        if (this.state.selectableTargets[0].layer === 'stop') {
          id = this.state.selectableTargets[0].feature.properties.gtfsId;
          contents = (
            <Relay.RootContainer
              Component={StopMarkerPopup}
              route={new StopRoute({
                stopId: this.state.selectableTargets[0].feature.properties.gtfsId,
                date: this.context.getStore('TimeStore').getCurrentTime().format('YYYYMMDD'),
              })}
              renderLoading={loadingPopup}
              renderFetched={data =>
                <StopMarkerPopupWithContext {...data} context={this.context} />
              }
            />
          );
        } else if (this.state.selectableTargets[0].layer === 'citybike') {
          id = this.state.selectableTargets[0].feature.properties.id;
          contents = (
            <Relay.RootContainer
              Component={CityBikePopup}
              forceFetch
              route={new CityBikeRoute({
                stationId: this.state.selectableTargets[0].feature.properties.id,
              })}
              renderLoading={loadingPopup}
              renderFetched={data => <CityBikePopupWithContext {...data} context={this.context} />}
            />
          );
        }
        popup = (
          <Popup
            map={this.props.map}
            layerContainer={this.props.layerContainer}
            key={id}
            offset={[106, 3]}
            closeButton={false}
            minWidth={250}
            maxWidth={250}
            autoPanPaddingTopLeft={[5, 125]}
            className="popup"
            position={this.state.coords}
            ref="popup"
          >
              {contents}
          </Popup>
          );
      } else if (this.state.selectableTargets.length > 1) {
        popup = (
          <Popup
            map={this.props.map}
            layerContainer={this.props.layerContainer}
            key={this.state.coords.toString()}
            offset={[106, 3]}
            closeButton={false}
            minWidth={250}
            maxWidth={250}
            autoPanPaddingTopLeft={[5, 125]}
            className="popup"
            maxHeight={220}
            position={this.state.coords}
            ref="popup"
          >
            <MarkerSelectPopupWithContext
              selectRow={this.selectRow}
              options={this.state.selectableTargets}
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
