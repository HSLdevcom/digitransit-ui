import React from 'react';
import cx from 'classnames';

import { isBrowser } from '../../util/browser';

let Polyline;

/* eslint-disable global-require */
if (isBrowser) {
  Polyline = require('react-leaflet/lib/Polyline').default;
}
/* eslint-enable global-require */

export default class Line extends React.Component {
  static propTypes = {
    thin: React.PropTypes.bool,
    passive: React.PropTypes.bool,
    mode: React.PropTypes.string.isRequired,
    geometry: React.PropTypes.array.isRequired,
  }

  static contextTypes = {
    config: React.PropTypes.object.isRequired,
  }

  componentDidMount() {
    // If we accidently draw the thin line over a normal one,
    // the halo will block it completely and we only see the thin one.
    // So we send the thin line layers (Leaflet calls every polyline its
    // own layer) to bottom. Note that all polylines do render inside the
    // same SVG, so CSS z-index can't be used.
    if (this.props.thin) {
      this.line.leafletElement.bringToBack();
      this.halo.leafletElement.bringToBack();
    }
  }

  componentDidUpdate() {
    if (!(this.props.passive && this.props.thin)) {
      this.line.leafletElement.bringToFront();
    }
  }

  // https://github.com/Leaflet/Leaflet/issues/2662
  // updating className does not work currently :(

  render() {
    const className = cx([this.props.mode, { thin: this.props.thin }]);

    const lineConfig = this.context.config.map.line;
    let haloWeight = this.props.thin ? lineConfig.halo.thinWeight : lineConfig.halo.weight;
    let legWeight = this.props.thin ? lineConfig.leg.thinWeight : lineConfig.leg.weight;

    if (this.props.passive) {
      haloWeight *= 0.5;
      legWeight *= 0.5;
    }

    return (
      <div style={{ display: 'none' }}>
        <Polyline
          key="halo"
          ref={(el) => { this.halo = el; }}
          positions={this.props.geometry}
          className={`leg-halo ${className}`}
          weight={haloWeight}
          interactive={false}
        />
        <Polyline
          key="line"
          ref={(el) => { this.line = el; }}
          positions={this.props.geometry}
          className={`leg ${className}`}
          color={this.props.passive ? '#758993' : 'currentColor'}
          weight={legWeight}
          interactive={false}
        />
      </div>
    );
  }
}
