import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../../Icon';
import { isBrowser } from '../../../util/browser';
import { legShape } from '../../../util/shapes';

/* eslint-disable global-require */

const Marker = isBrowser && require('react-leaflet/es/Marker').default;
const L = isBrowser && require('leaflet');

/* eslint-enable global-require */

class LegMarker extends React.Component {
  static propTypes = {
    leg: legShape.isRequired,
    mode: PropTypes.string.isRequired,
    color: PropTypes.string,
    zIndexOffset: PropTypes.number,
    wide: PropTypes.bool,
    style: PropTypes.string,
  };

  static defaultProps = {
    color: 'currentColor',
    zIndexOffset: undefined,
    wide: false,
    style: undefined,
  };

  // An arrow marker will be displayed if the normal marker can't fit
  getLegMarker() {
    const color = this.props.color ? this.props.color : 'currentColor';
    const className = this.props.wide ? 'wide' : '';
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
            <div class="${className}" style="--background-color: ${color}">
            ${Icon.asString({
              img: `icon-icon_${this.props.mode}`,
              className: 'map-route-icon',
              color,
            })}
              <span class="map-route-number" aria-hidden="true">${
                this.props.leg.name
              }</span>
              <span class="sr-only">${this.props.leg.name.toLowerCase()}</span>
            </div>`,
          className: `${
            this.props.style ? `arrow-${this.props.style}` : 'legmarker'
          } ${this.props.mode}`,
          iconSize: null,
        })}
        zIndexOffset={this.props.zIndexOffset}
        keyboard={false}
      />
    );
  }

  render() {
    if (!isBrowser) {
      return '';
    }

    return <div>{this.getLegMarker()}</div>;
  }
}

export default LegMarker;
