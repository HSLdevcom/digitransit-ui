import React from 'react';
import { isBrowser } from '../../../util/browser';

/* eslint-disable global-require */

const Marker = isBrowser && require('react-leaflet/lib/Marker').default;
const L = isBrowser && require('leaflet');

/* eslint-enable global-require */

function fixName(name) {
  if (!name) return '';

  // minimum size can't be set because of flex bugs
  // so add whitespace to make the name wider

  if (name.length === 1) {
    return `\u00A0${name}\u00A0`;
  } else if (name.length === 2) {
    return `\u202F${name}\u202F`;
  }
  return name;
}


export default class LegMarker extends React.Component {
  static contextTypes = {
    map: React.PropTypes.object.isRequired,
  }

  static propTypes = {
    leg: React.PropTypes.object.isRequired,
    mode: React.PropTypes.string.isRequired,
  };

  componentDidMount() {
    this.context.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount = () => {
    this.context.map.off('zoomend', this.onMapZoom);
  }

  onMapZoom = () => {
    this.forceUpdate();
  }

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
          html: `<div>${fixName(this.props.leg.name)}</div>`,
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

    const p1 = this.context.map.latLngToLayerPoint(this.props.leg.from);
    const p2 = this.context.map.latLngToLayerPoint(this.props.leg.to);
    const distance = p1.distanceTo(p2);
    const minDistanceToShow = 64;

    return (
      <div>
        {distance >= minDistanceToShow && this.getLegMarker()}
      </div>
    );
  }
}
