import isFunction from 'lodash/isFunction';
import PropTypes from 'prop-types';
import React from 'react';
import { withLeaflet } from 'react-leaflet/es/context';
import Marker from 'react-leaflet/es/Marker';
import Popup from 'react-leaflet/es/Popup';
import { default as L } from 'leaflet';
import { configShape, locationShape } from '../../util/shapes';

class GenericMarker extends React.Component {
  static displayName = 'GenericMarker';

  static contextTypes = {
    config: configShape.isRequired,
  };

  static propTypes = {
    shouldRender: PropTypes.func,
    position: locationShape.isRequired,
    getIcon: PropTypes.func.isRequired,
    renderName: PropTypes.bool,
    name: PropTypes.string,
    maxWidth: PropTypes.number,
    children: PropTypes.node,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        getZoom: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
    onClick: PropTypes.func,
  };

  static defaultProps = {
    shouldRender: () => true,
    onClick: () => {},
    renderName: false,
    name: '',
    maxWidth: undefined,
    children: undefined,
  };

  state = { zoom: this.props.leaflet.map.getZoom() };

  componentDidMount() {
    this.props.leaflet.map.on('zoomend', this.onMapMove);
  }

  componentWillUnmount() {
    this.props.leaflet.map.off('zoomend', this.onMapMove);
  }

  onMapMove = () => this.setState({ zoom: this.props.leaflet.map.getZoom() });

  getMarker = () => (
    <Marker
      position={{ lat: this.props.position.lat, lng: this.props.position.lon }}
      icon={this.props.getIcon(this.state.zoom)}
      onClick={this.props.onClick}
      keyboard={false}
    >
      {this.props.children && (
        <Popup
          maxWidth={
            this.props.maxWidth ||
            this.context.config.map.genericMarker.popup.maxWidth
          }
          minWidth={this.context.config.map.genericMarker.popup.minWidth}
          className="popup"
        >
          {this.props.children}
        </Popup>
      )}
    </Marker>
  );

  getNameMarker() {
    if (
      !this.props.renderName ||
      this.props.leaflet.map.getZoom() <
        this.context.config.map.genericMarker.nameMarkerMinZoom
    ) {
      return false;
    }
    return (
      <Marker
        key={`${this.props.name}_text`}
        position={{
          lat: this.props.position.lat,
          lng: this.props.position.lon,
        }}
        interactive={false}
        icon={L.divIcon({
          html: `<div>${this.props.name}</div>`,
          className: 'popup',
          iconSize: [150, 0],
          iconAnchor: [-8, 7],
        })}
        keyboard={false}
      />
    );
  }

  render() {
    const { shouldRender } = this.props;
    const { zoom } = this.state;
    if (isFunction(shouldRender) && !shouldRender(zoom)) {
      return null;
    }

    return (
      <React.Fragment>
        {this.getMarker()}
        {this.getNameMarker()}
      </React.Fragment>
    );
  }
}

const leafletComponent = withLeaflet(GenericMarker);
export { leafletComponent as default, GenericMarker as Component };
