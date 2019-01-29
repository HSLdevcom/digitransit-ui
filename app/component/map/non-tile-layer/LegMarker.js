import PropTypes from 'prop-types';
import React from 'react';

import { withLeaflet } from 'react-leaflet/es/context';

import { isBrowser } from '../../../util/browser';

/* eslint-disable global-require */

const Marker = isBrowser && require('react-leaflet/es/Marker').default;
const L = isBrowser && require('leaflet');

/* eslint-enable global-require */

function fixName(name) {
  if (!name) {
    return '';
  }

  // minimum size can't be set because of flex bugs
  // so add whitespace to make the name wider

  if (name.length === 1) {
    return `\u00A0${name}\u00A0`;
  }
  if (name.length === 2) {
    return `\u202F${name}\u202F`;
  }
  return name;
}

class LegMarker extends React.Component {
  static propTypes = {
    leg: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    color: PropTypes.string,
    leaflet: PropTypes.shape({
      map: PropTypes.shape({
        latLngToLayerPoint: PropTypes.func.isRequired,
        on: PropTypes.func.isRequired,
        off: PropTypes.func.isRequired,
      }).isRequired,
    }).isRequired,
  };

  static defaultProps = {
    color: 'currentColor',
  };

  componentDidMount() {
    this.props.leaflet.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount = () => {
    this.props.leaflet.map.off('zoomend', this.onMapZoom);
  };

  onMapZoom = () => {
    this.forceUpdate();
  };

  getLegMarker() {
    return (
      <Marker
        key={`${this.props.leg.name}_text`}
        position={{
          lat: this.props.leg.lat,
          lng: this.props.leg.lon,
        }}
        interactive={false}
        icon={L.divIcon({
          html: `
            <div style='color: ${this.props.color}'>
              ${fixName(this.props.leg.name)}
            </div>`,
          className: `legmarker ${this.props.mode}`,
          iconSize: null,
        })}
      />
    );
  }

  render() {
    if (!isBrowser) {
      return '';
    }

    const p1 = this.props.leaflet.map.latLngToLayerPoint(this.props.leg.from);
    const p2 = this.props.leaflet.map.latLngToLayerPoint(this.props.leg.to);
    const distance = p1.distanceTo(p2);
    const minDistanceToShow = 64;

    return <div>{distance >= minDistanceToShow && this.getLegMarker()}</div>;
  }
}

export default withLeaflet(LegMarker);
