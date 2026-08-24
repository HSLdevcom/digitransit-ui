import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { routerShape } from 'found';
import { default as L } from 'leaflet';
import { stopShape, configShape } from '../../../util/shapes';
import GenericMarker from '../GenericMarker';
import Icon from '../../Icon';
import {
  getCaseRadius,
  getStopRadius,
  getHubRadius,
  renderAsString,
} from '../../../util/mapIconUtils';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { PREFIX_STOPS } from '../../../util/path';
import { STOP_STATUS_BADGE_IMGS } from '../../../util/stopStatusUtils';

const STATUS_BADGE_ZOOM_THRESHOLD = 15;

class StopMarker extends React.Component {
  static propTypes = {
    stop: stopShape.isRequired,
    mode: PropTypes.string.isRequired,
    renderName: PropTypes.bool,
    disableModeIcons: PropTypes.bool,
    disableIconBorder: PropTypes.bool,
    limitZoom: PropTypes.number,
    selected: PropTypes.bool,
    colorOverride: PropTypes.string,
    appendClass: PropTypes.string,
    stopStatus: PropTypes.string,
  };

  static defaultProps = {
    renderName: false,
    disableModeIcons: false,
    disableIconBorder: false,
    limitZoom: undefined,
    selected: false,
    colorOverride: undefined,
    appendClass: undefined,
    stopStatus: undefined,
  };

  static contextTypes = {
    config: configShape.isRequired,
    router: routerShape.isRequired,
  };

  redirectToStopPage = () => {
    if (
      window.location.pathname.indexOf('bike') === -1 &&
      window.location.pathname.indexOf('walk') === -1
    ) {
      const pathPrefixMatch =
        window.location.pathname.match(/^\/([a-z]{2,})\//);
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
    const iconId = `icon_${this.props.mode}`;
    let size;
    if (zoom <= this.context.config.stopsSmallMaxZoom) {
      size = this.context.config.stopsIconSize.small;
    } else if (this.props.selected) {
      size = this.context.config.stopsIconSize.selected;
    } else {
      size = this.context.config.stopsIconSize.default;
    }

    return L.divIcon({
      html: renderAsString(<Icon img={iconId} className="mode-icon" />),
      iconSize: [size, size],
      className: cx('cursor-pointer', this.props.mode, {
        small: size === this.context.config.stopsIconSize.small,
        selected: this.props.selected,
        'disable-icon-border': this.props.disableIconBorder,
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
          ? Math.max(zoom, STATUS_BADGE_ZOOM_THRESHOLD)
          : zoom || STATUS_BADGE_ZOOM_THRESHOLD;
    }

    const radius = getCaseRadius(calcZoom) * scale;
    const stopRadius = getStopRadius(calcZoom) * scale;
    const hubRadius = getHubRadius(calcZoom) * scale;

    const inner = (stopRadius + hubRadius) / 2;
    const stroke = stopRadius - hubRadius;

    // see app/util/mapIconUtils.js for the canvas version
    let iconSvg = `
      <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
        <circle class="${cx(
          'stop',
          this.props.appendClass,
        )}" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}" color="${
          this.props.colorOverride ?? ''
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
    } else if (this.props.stopStatus) {
      const badgeImg = STOP_STATUS_BADGE_IMGS[this.props.stopStatus];
      if (badgeImg) {
        if (zoom < STATUS_BADGE_ZOOM_THRESHOLD) {
          const circleSize = radius * 3.5;
          const cr = circleSize / 2;
          iconSvg = `<svg viewBox="0 0 ${circleSize} ${circleSize}" width="${circleSize}" height="${circleSize}"><circle class="stop-badge-${
            this.props.stopStatus
          }" cx="${cr}" cy="${cr}" r="${
            cr - 1.5
          }" stroke="#fff" stroke-width="2.5"/></svg>`;
          return L.divIcon({
            html: iconSvg,
            iconSize: [circleSize, circleSize],
            // disable-icon-border prevents the global map.scss SVG border from doubling the stroke
            className: cx(
              this.props.mode,
              'cursor-pointer',
              'disable-icon-border',
            ),
          });
        }
        const badgeSize = radius * 3.5;
        const borderWidth = 0.5;
        const innerSize = badgeSize - borderWidth * 2;
        const center = badgeSize / 2;
        // White circle acts as border; nested svg scales the badge inside it
        iconSvg = `<svg width="${badgeSize}" height="${badgeSize}" style="filter:drop-shadow(0 1px 2px var(--color-shadow-strong))"><circle cx="${center}" cy="${center}" r="${center}" fill="#fff"/><svg x="${borderWidth}" y="${borderWidth}" width="${innerSize}" height="${innerSize}" viewBox="0 0 40 40"><use href="#${badgeImg}" width="100%" height="100%"/></svg></svg>`;
        return L.divIcon({
          html: iconSvg,
          iconSize: [badgeSize, badgeSize],
          // disable-icon-border prevents map.scss from adding a second CSS border on the svg
          className: cx(
            this.props.mode,
            'cursor-pointer',
            'disable-icon-border',
          ),
        });
      }
    }

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: cx(this.props.mode, 'cursor-pointer', {
        'disable-icon-border': this.props.disableIconBorder,
      }),
    });
  };

  render() {
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
