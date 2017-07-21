import PropTypes from 'prop-types';
import React from 'react';
import provideContext from 'fluxible-addons-react/provideContext';
import { intlShape } from 'react-intl';
import { routerShape, locationShape } from 'react-router';
import cx from 'classnames';

import StopMarkerPopup from '../popups/StopMarkerPopupContainer';
import GenericMarker from '../GenericMarker';
import Icon from '../../Icon';
import {
  getCaseRadius,
  getStopRadius,
  getHubRadius,
} from '../../../util/mapIconUtils';
import { isBrowser } from '../../../util/browser';

let L;

/* eslint-disable global-require */
// TODO When server side rendering is re-enabled,
//      these need to be loaded only when isBrowser is true.
//      Perhaps still using the require from webpack?
if (isBrowser) {
  L = require('leaflet');
}
/* eslint-enable global-require */

const StopMarkerPopupContainer = provideContext(StopMarkerPopup, {
  intl: intlShape.isRequired,
  router: routerShape.isRequired,
  location: locationShape.isRequired,
  route: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
});

class StopMarker extends React.Component {
  static propTypes = {
    stop: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    renderName: PropTypes.bool,
    disableModeIcons: PropTypes.bool,
    selected: PropTypes.bool,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
    route: PropTypes.object.isRequired,
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  getModeIcon = zoom => {
    const iconId = `icon-icon_${this.props.mode}`;
    const icon = Icon.asString(iconId, 'mode-icon');
    let size;
    if (zoom <= this.context.config.stopsSmallMaxZoom) {
      size = this.context.config.stopsIconSize.small;
    } else if (this.props.selected) {
      size = this.context.config.stopsIconSize.selected;
    } else {
      size = this.context.config.stopsIconSize.default;
    }

    return L.divIcon({
      html: icon,
      iconSize: [size, size],
      className: cx('cursor-pointer', this.props.mode, {
        small: size === this.context.config.stopsIconSize.small,
        selected: this.props.selected,
      }),
    });
  };

  getIcon = zoom => {
    const scale = this.props.stop.transfer || this.props.selected ? 1.5 : 1;
    const calcZoom =
      this.props.stop.transfer || this.props.selected
        ? Math.max(zoom, 15)
        : zoom;

    const radius = getCaseRadius(calcZoom) * scale;
    const stopRadius = getStopRadius(calcZoom) * scale;
    const hubRadius = getHubRadius(calcZoom) * scale;

    const inner = (stopRadius + hubRadius) / 2;
    const stroke = stopRadius - hubRadius;

    // see app/util/mapIconUtils.js for the canvas version
    let iconSvg = `
      <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
        <circle class="stop-halo" cx="${radius}" cy="${radius}" r="${radius}"/>
        <circle class="stop" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}"/>
        ${inner > 7 && this.props.stop.platformCode
          ? `<text x="${radius}" y="${radius}" text-anchor="middle" dominant-baseline="central"
            fill="#333" font-size="${1.2 * inner}px"
            font-family="Gotham XNarrow SSm A, Gotham XNarrow SSm B, Arial, sans-serif"
            >${this.props.stop.platformCode}</text>`
          : ''}
      </svg>
    `;

    if (radius === 0) {
      iconSvg = '';
    }

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: `${this.props.mode} cursor-pointer`,
    });
  };

  render() {
    if (!isBrowser) {
      return '';
    }

    const currentTime = this.context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix();

    return (
      <GenericMarker
        position={{
          lat: this.props.stop.lat,
          lon: this.props.stop.lon,
        }}
        getIcon={
          this.context.config.map.useModeIconsInNonTileLayer &&
          !this.props.disableModeIcons
            ? this.getModeIcon
            : this.getIcon
        }
        id={this.props.stop.gtfsId}
        renderName={this.props.renderName}
        name={this.props.stop.name}
      >
        <StopMarkerPopupContainer
          stopId={this.props.stop.gtfsId}
          currentTime={currentTime}
        />
      </GenericMarker>
    );
  }
}

export default StopMarker;
