import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import { isBrowser } from '../../util/browser';

let Polyline;

/* eslint-disable global-require */
if (isBrowser) {
  Polyline = require('react-leaflet/es/Polyline').default;
}
/* eslint-enable global-require */

export default class Line extends React.Component {
  static propTypes = {
    thin: PropTypes.bool,
    passive: PropTypes.bool,
    color: PropTypes.string,
    mode: PropTypes.string.isRequired,
    geometry: PropTypes.array.isRequired,
  };

  static contextTypes = {
    config: PropTypes.object.isRequired,
  };

  componentDidMount() {
    // If we accidently draw the thin line over a normal one,
    // the halo will block it completely and we only see the thin one.
    // So we send the thin line layers (Leaflet calls every polyline its
    // own layer) to bottom. Note that all polylines do render inside the
    // same SVG, so CSS z-index can't be used.
    if (this.props.thin) {
      if (this.line) {
        this.line.leafletElement.bringToBack();
      }
      if (this.halo) {
        this.halo.leafletElement.bringToBack();
      }
    }
  }

  componentDidUpdate() {
    if (!(this.props.passive && this.props.thin) && this.line) {
      this.line.leafletElement.bringToFront();
    }
  }

  // https://github.com/Leaflet/Leaflet/issues/2662
  // updating className does not work currently :(

  render() {
    const className = cx([this.props.mode, { thin: this.props.thin }]);

    let filteredPoints;
    if (this.props.geometry) {
      filteredPoints = this.props.geometry.filter(
        point => point.lat !== null && point.lon !== null,
      );
    }

    if (!filteredPoints || filteredPoints.length === 0) {
      return null;
    }

    const lineConfig = this.context.config.map.line;

    let color = this.props.color ? this.props.color : 'currentColor';
    let haloWeight = this.props.thin
      ? lineConfig.halo.thinWeight
      : lineConfig.halo.weight;
    let legWeight = this.props.thin
      ? lineConfig.leg.thinWeight
      : lineConfig.leg.weight;

    if (this.props.passive) {
      haloWeight *= 0.5;
      legWeight *= 0.5;
      if (lineConfig.passiveColor) {
        color = lineConfig.passiveColor;
      }
    }

    return (
      <div style={{ display: 'none' }}>
        <Polyline
          key="halo"
          ref={el => {
            this.halo = el;
          }}
          positions={filteredPoints}
          className={`leg-halo ${className}`}
          weight={haloWeight}
          interactive={false}
        />
        <Polyline
          key="line"
          ref={el => {
            this.line = el;
          }}
          positions={filteredPoints}
          className={`leg ${className}`}
          color={color}
          weight={legWeight}
          interactive={false}
        />
      </div>
    );
  }
}
