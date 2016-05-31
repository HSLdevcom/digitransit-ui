import React from 'react';
import Relay from 'react-relay';
import StopRoute from '../../../route/StopRoute';
import CityBikeRoute from '../../../route/CityBikeRoute';
import Popup from '../dynamic-popup';
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

class TileLayerContainer extends BaseTileLayer {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intl.intlShape.isRequired,
    router: React.PropTypes.object.isRequired,
    route: React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(...props);

    this.merc = new SphericalMercator({
      size: props.tileSize || 256,
    });

    this.state = {
      stops: undefined,
      coords: undefined,
    };

    this.selectRow = this.selectRow.bind(this);
  }

  createTile = (tileCoords, done) => {
    const tile = new TileContainer(tileCoords, done, this.props);

    tile.onSelectableTargetClicked = (selectableTargets, coords) => {
      if (this.props.disableMapTracking) {
        this.props.disableMapTracking();
      }

      return this.setState({
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
      activeTiles = lodashFilter(this.leafletElement._tiles, tile =>
      /* eslint-enable no-underscore-dangle */
        tile.active
      );

      activeTiles.forEach(tile => {
        tile.el.layers.forEach(layer => {
          if (layer.onTimeChange) {
            layer.onTimeChange();
          }
        });
      });

      this.forceUpdate();
    }
  }

  componentDidMount() {
    this.context.getStore('TimeStore').addChangeListener(this.onTimeChange);

    const Layer = L.GridLayer.extend({
      createTile: this.createTile,
    });

    this.leafletElement = new Layer(omit(this.props, 'map'));
    this.props.map.addEventParent(this.leafletElement);

    /* eslint-disable no-underscore-dangle */
    this.leafletElement.on('click', e => {
      Object.keys(this.leafletElement._tiles)
        .filter(key =>
        this.leafletElement._tiles[key].active
      ).filter(key =>
        this.leafletElement._keyToBounds(key).contains(e.latlng)
      ).forEach(key =>
        this.leafletElement._tiles[key].el
        .onMapClick(e,
                    this.merc.px([e.latlng.lng, e.latlng.lat],
                    Number(key.split(':')[2]) + this.props.zoomOffset)
                    )
      );
    });
    /* eslint-enable no-underscore-dangle */
    return super.componentDidMount(...this.props);
  }

  componentWillUnmount() {
    this.context.getStore('TimeStore').removeChangeListener(this.onTimeChange);
  }

  componentDidUpdate() {
    return this.refs.popup != null ? this.refs.popup.leafletElement.openOn(this.props.map) : void 0;
  }

  selectRow(option) {
    return this.setState({
      selectableTargets: [option],
    });
  }

  render() {
    let popup;
    let contents;

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

    const loadingPopupStyle = {
      height: 150,
    };


    if (typeof this.state.selectableTargets !== 'undefined') {
      if (this.state.selectableTargets.length === 1) {
        if (this.state.selectableTargets[0].layer === 'stop') {
          contents = (<Relay.RootContainer
            Component={StopMarkerPopup}
            route={new StopRoute({
              stopId: this.state.selectableTargets[0].feature.properties.gtfsId,
              date: this.context.getStore('TimeStore').getCurrentTime().format('YYYYMMDD'),
            })}
            renderLoading={() =>
              (
              <div
                className="card"
                style={loadingPopupStyle}
              >
                <div className="spinner-loader" />
              </div>
              )
            }
            renderFetched={data =>
              (
              <StopMarkerPopupWithContext
                {...data}
                context={this.context}
              />
              )
            }
          />);
        } else {
          contents = (<Relay.RootContainer
            Component={CityBikePopup}
            forceFetch
            route={new CityBikeRoute({
              stationId: this.state.selectableTargets[0].feature.properties.id,
            })}
            renderLoading={() =>
              (
              <div className="card" style={loadingPopupStyle}>
                <div className="spinner-loader" />
              </div>
              )
            }
            renderFetched={data =>
              (
              <CityBikePopupWithContext
                {...data}
                context={this.context}
              />
              )
          }
          />);
        }
        popup = (
          <Popup
            map={this.props.map}
            layerContainer={this.props.layerContainer}
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

    return (
      <div
        style={{ display: 'none' }}
      >
        {popup}
      </div>
    );
  }
}

export default TileLayerContainer;
