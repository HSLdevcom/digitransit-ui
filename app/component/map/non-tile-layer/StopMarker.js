import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';

import { routerShape } from 'found';
import GenericMarker from '../GenericMarker';
import Icon from '../../Icon';
import {
  getCaseRadius,
  getStopRadius,
  getHubRadius,
} from '../../../util/mapIconUtils';
import { isBrowser } from '../../../util/browser';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { PREFIX_STOPS } from '../../../util/path';

let L;

/* eslint-disable global-require */
// TODO When server side rendering is re-enabled,
//      these need to be loaded only when isBrowser is true.
//      Perhaps still using the require from webpack?
if (isBrowser) {
  L = require('leaflet');
}
/* eslint-enable global-require */

class StopMarker extends React.Component {
  static propTypes = {
    stop: PropTypes.object.isRequired,
    mode: PropTypes.string.isRequired,
    renderName: PropTypes.bool,
    disableModeIcons: PropTypes.bool,
    limitZoom: PropTypes.number,
    selected: PropTypes.bool,
    colorOverride: PropTypes.string,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    config: PropTypes.object.isRequired,
    router: routerShape.isRequired,
  };

  redirectToStopPage = () => {
    if (
      window.location.pathname.indexOf('bike') === -1 &&
      window.location.pathname.indexOf('walk') === -1
    ) {
      const pathPrefixMatch = window.location.pathname.match(
        /^\/([a-z]{2,})\//,
      );
      const context =
        pathPrefixMatch && pathPrefixMatch[1] !== this.context.config.indexPath
          ? pathPrefixMatch[1]
          : 'index';
      addAnalyticsEvent({
        action: 'SelectMapPoint',
        category: 'Map',
        name: 'stop',
        type: this.props.mode.toUpperCase(),
        context,
      });
    }
    const prefix = PREFIX_STOPS;
    this.context.router.push(
      `/${prefix}/${encodeURIComponent(this.props.stop.gtfsId)}`,
    );
  };

  getModeIcon = zoom => {
    const iconId = `icon-icon_${this.props.mode}`;
    const icon = Icon.asString({ img: iconId, className: 'mode-icon' });
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

    let calcZoom;
    if (this.props.limitZoom) {
      calcZoom = Math.min(zoom, this.props.limitZoom);
    } else {
      calcZoom =
        this.props.stop.transfer || this.props.selected
          ? Math.max(zoom, 15)
          : zoom || 15;
    }

    const radius = getCaseRadius(calcZoom) * scale;
    const stopRadius = getStopRadius(calcZoom) * scale;
    const hubRadius = getHubRadius(calcZoom) * scale;

    const inner = (stopRadius + hubRadius) / 2;
    const stroke = stopRadius - hubRadius;

    // see app/util/mapIconUtils.js for the canvas version
    let iconSvg = `
      <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
        <circle class="stop" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}" color="${
      this.props.colorOverride
    }" />
        ${
          inner > 7 && this.props.stop.platformCode
            ? `<text x="${radius}" y="${radius}" text-anchor="middle" dominant-baseline="central"
            fill="#333" font-size="${1.2 * inner}px"
            font-family="Gotham XNarrow A, Gotham Rounded A, Gotham Rounded B, Roboto Condensed, Roboto, Arial, sans-serif"
            >${this.props.stop.platformCode}</text>`
            : ''
        }
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
        onClick={this.redirectToStopPage}
      />
    );
  }
}

export default StopMarker;
