import React from 'react';

const isBrowser = typeof window !== 'undefined' && window !== null;

/* eslint-disable global-require */

const Marker = isBrowser && require('react-leaflet/lib/Marker').default;
const L = isBrowser && require('leaflet');

/* eslint-enable global-require */

class LegMarker extends React.Component {
  constructor(args) {
    super(...args);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
    this.onMapZoom = this.onMapZoom.bind(this);
  }

  componentDidMount() {
    this.props.map.on('zoomend', this.onMapZoom);
  }

  componentWillUnmount() {
    this.props.map.off('zoomend', this.onMapZoom);
  }

  onMapZoom() {
    this.forceUpdate();
  }

  getLegMarker() {
    return (
      <Marker
        map={this.props.map}
        layerContainer={this.props.layerContainer}
        key={`${this.props.leg.name}_text`}
        position={{
          lat: this.props.leg.lat,
          lng: this.props.leg.lon,
        }}
        interactive={false}
        icon={L.divIcon({
          html: `<div>${this.props.leg.name}</div>`,
          className: `legmarker ${this.props.mode}`,
          iconSize: [1, 1],
        })}
      />
    );
  }

  render() {
    if (!isBrowser) {
      return '';
    }

    const p1 = this.props.map.latLngToLayerPoint(this.props.leg.from);
    const p2 = this.props.map.latLngToLayerPoint(this.props.leg.to);
    const distance = p1.distanceTo(p2);
    const minDistanceToShow = 64;

    return (
      <div>
        {distance >= minDistanceToShow && this.getLegMarker()}
      </div>
    );
  }
}

LegMarker.propTypes = {
  map: React.PropTypes.object.isRequired,
  layerContainer: React.PropTypes.object.isRequired,
  leg: React.PropTypes.object.isRequired,
  mode: React.PropTypes.string.isRequired,
};

export default LegMarker;
