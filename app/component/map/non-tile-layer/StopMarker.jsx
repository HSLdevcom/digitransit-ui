import PropTypes from 'prop-types';
import React from 'react';
import cx from 'classnames';
import { useRouter } from 'found';
import { default as L } from 'leaflet';
import { stopShape } from '../../../../utils/client/shapes';
import GenericMarker from '../GenericMarker';
import Icon from '../../Icon';
import {
  getCaseRadius,
  getStopRadius,
  getHubRadius,
  renderAsString,
} from '../../../../utils/client/mapIconUtils';
import { addAnalyticsEvent } from '../../../../utils/shared/analyticsUtils';
import { PREFIX_STOPS } from '../../../../utils/shared/path';
import { useConfigContext } from '../../../client/ConfigContext';

export const getStopMarkerAnalytics = (pathname, indexPath, mode) => {
  if (pathname.includes('bike') || pathname.includes('walk')) {
    return null;
  }
  const pathPrefixMatch = pathname.match(/^\/([a-z]{2,})\//);
  const context =
    pathPrefixMatch && pathPrefixMatch[1] !== indexPath
      ? pathPrefixMatch[1]
      : 'index';
  return {
    action: 'SelectMapPoint',
    category: 'Map',
    name: 'stop',
    type: mode.toUpperCase(),
    context,
  };
};

export const getStopMarkerPath = gtfsId =>
  `/${PREFIX_STOPS}/${encodeURIComponent(gtfsId)}`;

// The functions below compute plain values (icon size, class names, SVG
// markup) with no Leaflet dependency. They are exported for unit testing
// and can be reused as-is if the underlying map engine changes.
export const getModeIconSize = (zoom, config, selected) => {
  if (zoom <= config.stopsSmallMaxZoom) {
    return config.stopsIconSize.small;
  }
  if (selected) {
    return config.stopsIconSize.selected;
  }
  return config.stopsIconSize.default;
};

export const getModeIconClassName = (
  mode,
  size,
  config,
  selected,
  disableIconBorder,
) =>
  cx('cursor-pointer', mode, {
    small: size === config.stopsIconSize.small,
    selected,
    'disable-icon-border': disableIconBorder,
  });

export const getStopIconRadii = (zoom, { limitZoom, transfer, selected }) => {
  const scale = transfer || selected ? 1.5 : 1;

  let calcZoom;
  if (limitZoom) {
    calcZoom = Math.min(zoom, limitZoom);
  } else {
    calcZoom = transfer || selected ? Math.max(zoom, 15) : zoom || 15;
  }

  const radius = getCaseRadius(calcZoom) * scale;
  const stopRadius = getStopRadius(calcZoom) * scale;
  const hubRadius = getHubRadius(calcZoom) * scale;

  const inner = (stopRadius + hubRadius) / 2;
  const stroke = stopRadius - hubRadius;

  return { radius, inner, stroke };
};

// see utils/client/mapIconUtils.js for the canvas version
export const buildStopIconSvg = ({
  radius,
  inner,
  stroke,
  appendClass,
  colorOverride,
  platformCode,
}) => {
  if (radius === 0) {
    return '';
  }
  return `
      <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
        <circle class="stop ${appendClass}" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}"${
          colorOverride ? ` color="${colorOverride}"` : ''
        } />
        ${
          inner > 7 && platformCode
            ? `<text x="${radius}" y="${radius}" text-anchor="middle" dominant-baseline="central"
            fill="#333" font-size="${1.2 * inner}px"
            font-family="Gotham XNarrow A, Gotham Rounded A, Gotham Rounded B, Roboto Condensed, Roboto, Arial, sans-serif"
            >${platformCode}</text>`
            : ''
        }
      </svg>
    `;
};

export const getStopIconClassName = (mode, disableIconBorder) =>
  cx(mode, 'cursor-pointer', {
    'disable-icon-border': disableIconBorder,
  });

export default function StopMarker({
  stop,
  mode,
  renderName = false,
  disableModeIcons = false,
  disableIconBorder = false,
  limitZoom,
  selected = false,
  colorOverride,
  appendClass,
}) {
  const config = useConfigContext();
  const { router } = useRouter();

  const redirectToStopPage = () => {
    const analyticsEvent = getStopMarkerAnalytics(
      window.location.pathname,
      config.indexPath,
      mode,
    );
    if (analyticsEvent) {
      addAnalyticsEvent(analyticsEvent);
    }
    router.push(getStopMarkerPath(stop.gtfsId));
  };

  const getModeIcon = zoom => {
    const iconId = `icon_${mode}`;
    const size = getModeIconSize(zoom, config, selected);

    return L.divIcon({
      html: renderAsString(<Icon img={iconId} className="mode-icon" />),
      iconSize: [size, size],
      className: getModeIconClassName(
        mode,
        size,
        config,
        selected,
        disableIconBorder,
      ),
    });
  };

  const getIcon = zoom => {
    const { radius, inner, stroke } = getStopIconRadii(zoom, {
      limitZoom,
      transfer: stop.transfer,
      selected,
    });

    const iconSvg = buildStopIconSvg({
      radius,
      inner,
      stroke,
      appendClass,
      colorOverride,
      platformCode: stop.platformCode,
    });

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: getStopIconClassName(mode, disableIconBorder),
    });
  };

  return (
    <GenericMarker
      position={{
        lat: stop.lat,
        lon: stop.lon,
      }}
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
};
