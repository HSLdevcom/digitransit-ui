import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { useRouter } from 'found';
import L from 'leaflet';
import { stopShape } from '../../../util/shapes';
import { useConfigContext } from '../../../configurations/ConfigContext';
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

function StopMarker({
  stop,
  mode,
  renderName = false,
  disableModeIcons = false,
  disableIconBorder = false,
  limitZoom = undefined,
  selected = false,
  colorOverride = undefined,
  appendClass = undefined,
  stopStatus = undefined,
}) {
  const config = useConfigContext();
  const { router } = useRouter();

  const redirectToStopPage = () => {
    const { pathname } = window.location;
    if (!pathname.includes('bike') && !pathname.includes('walk')) {
      const pathPrefixMatch = pathname.match(/^\/([a-z]{2,})\//);
      const context =
        pathPrefixMatch && pathPrefixMatch[1] !== config.indexPath
          ? pathPrefixMatch[1]
          : 'index';
      addAnalyticsEvent({
        action: 'SelectMapPoint',
        category: 'Map',
        name: 'stop',
        type: mode.toUpperCase(),
        context,
      });
    }
    router.push(`/${PREFIX_STOPS}/${encodeURIComponent(stop.gtfsId)}`);
  };

  const getModeIcon = zoom => {
    const iconId = `icon_${mode}`;
    let size;
    if (zoom <= config.stopsSmallMaxZoom) {
      size = config.stopsIconSize.small;
    } else if (selected) {
      size = config.stopsIconSize.selected;
    } else {
      size = config.stopsIconSize.default;
    }

    return L.divIcon({
      html: renderAsString(<Icon img={iconId} className="mode-icon" />),
      iconSize: [size, size],
      className: cx('cursor-pointer', mode, {
        small: size === config.stopsIconSize.small,
        selected,
        'disable-icon-border': disableIconBorder,
      }),
    });
  };

  const getIcon = zoom => {
    const scale = stop.transfer || selected ? 1.5 : 1;

    let calcZoom;
    if (limitZoom) {
      calcZoom = Math.min(zoom, limitZoom);
    } else {
      calcZoom =
        stop.transfer || selected
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
          appendClass,
        )}" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}" color="${
          colorOverride ?? ''
        }" />
        ${
          inner > 7 && stop.platformCode
            ? `<text x="${radius}" y="${radius}" text-anchor="middle" dominant-baseline="central"
            fill="#333" font-size="${1.2 * inner}px"
            font-family="Gotham XNarrow A, Gotham Rounded A, Gotham Rounded B, Roboto Condensed, Roboto, Arial, sans-serif"
            >${stop.platformCode}</text>`
            : ''
        }
      </svg>
    `;

    if (radius === 0) {
      iconSvg = '';
    } else if (stopStatus) {
      const badgeImg = STOP_STATUS_BADGE_IMGS[stopStatus];
      if (badgeImg) {
        if (zoom < STATUS_BADGE_ZOOM_THRESHOLD) {
          const circleSize = radius * 3.5;
          const cr = circleSize / 2;
          iconSvg = `<svg viewBox="0 0 ${circleSize} ${circleSize}" width="${circleSize}" height="${circleSize}"><circle class="stop-badge-${stopStatus}" cx="${cr}" cy="${cr}" r="${
            cr - 1.5
          }" stroke="#fff" stroke-width="2.5"/></svg>`;
          return L.divIcon({
            html: iconSvg,
            iconSize: [circleSize, circleSize],
            // disable-icon-border prevents the global map.scss SVG border from doubling the stroke
            className: cx(mode, 'cursor-pointer', 'disable-icon-border'),
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
          className: cx(mode, 'cursor-pointer', 'disable-icon-border'),
        });
      }
    }

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: cx(mode, 'cursor-pointer', {
        'disable-icon-border': disableIconBorder,
      }),
    });
  };

  return (
    <GenericMarker
      position={{ lat: stop.lat, lon: stop.lon }}
      getIcon={
        config.map.useModeIconsInNonTileLayer && !disableModeIcons
          ? getModeIcon
          : getIcon
      }
      id={stop.gtfsId}
      renderName={renderName}
      name={stop.name}
      onClick={redirectToStopPage}
    />
  );
}

StopMarker.propTypes = {
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

export default StopMarker;
