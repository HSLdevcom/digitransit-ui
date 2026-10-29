import PropTypes from 'prop-types';
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
import {
  STOP_STATUS,
  STOP_STATUS_BADGE_IMGS,
} from '../../../../utils/client/stopStatusUtils';

// Below this zoom the status badge is drawn as a plain colored dot.
const STATUS_BADGE_ZOOM_THRESHOLD = 15;
// Zoom level assumed for icon sizing when the map zoom is unknown or the stop is emphasized.
const MIN_ICON_SIZE_ZOOM = 15;

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
    calcZoom =
      transfer || selected
        ? Math.max(zoom, MIN_ICON_SIZE_ZOOM)
        : zoom || MIN_ICON_SIZE_ZOOM;
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
  withHalo = false,
}) => {
  if (radius === 0) {
    return '';
  }
  // 1px white outline hugging the outer edge of the stop ring, may extend past the icon bounds
  const haloRadius = inner + stroke / 2 + 1;
  return `
      <svg viewBox="0 0 ${radius * 2} ${radius * 2}"${
        withHalo ? ' style="overflow:visible"' : ''
      }>
        ${
          withHalo
            ? `<circle class="stop-halo" cx="${radius}" cy="${radius}" r="${haloRadius}" />`
            : ''
        }
        <circle class="${cx(
          'stop',
          appendClass,
        )}" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}"${
          colorOverride ? ` color="${colorOverride}"` : ''
        } />
        ${
          inner > 7 && platformCode
            ? `<text x="${radius}" y="${radius}" text-anchor="middle" dominant-baseline="central"
            fill="#333" font-size="${1.2 * inner}px"
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
  stopStatus,
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

    const badgeImg = radius > 0 && STOP_STATUS_BADGE_IMGS[stopStatus];
    if (badgeImg) {
      const badgeSize = radius * 3.5;
      if (zoom < STATUS_BADGE_ZOOM_THRESHOLD) {
        const cr = badgeSize / 2;
        return L.divIcon({
          html: `<svg viewBox="0 0 ${badgeSize} ${badgeSize}" width="${badgeSize}" height="${badgeSize}"><circle class="stop-badge-${stopStatus}" cx="${cr}" cy="${cr}" r="${
            cr - 1.5
          }" stroke="#fff" stroke-width="2.5"/></svg>`,
          iconSize: [badgeSize, badgeSize],
          // disable-icon-border prevents the global map.scss SVG border from doubling the stroke
          className: getStopIconClassName(mode, true),
        });
      }
      const borderWidth = 0.5;
      const innerSize = badgeSize - borderWidth * 2;
      const center = badgeSize / 2;
      const isAlertBadge = stopStatus === STOP_STATUS.ALERT;
      const background = isAlertBadge
        ? ''
        : `<circle cx="${center}" cy="${center}" r="${center}" fill="#fff"/>`;
      // map.scss clips leaflet-marker-icon svgs to a circle; override it so
      // the non-circular triangle isn't cut off at its corners.
      const svgStyle = `filter:drop-shadow(0 1px 2px var(--color-shadow-strong));${
        isAlertBadge ? 'border-radius:0;' : ''
      }`;
      const viewBox = isAlertBadge ? '-8 -8 302.46 302.46' : '0 0 40 40';
      return L.divIcon({
        html: `<svg width="${badgeSize}" height="${badgeSize}" style="${svgStyle}">${background}<svg x="${borderWidth}" y="${borderWidth}" width="${innerSize}" height="${innerSize}" viewBox="${viewBox}" ><use href="#${badgeImg}" width="100%" height="100%"/></svg></svg>`,
        iconSize: [badgeSize, badgeSize],
        className: getStopIconClassName(mode, true),
      });
    }

    const iconSvg = buildStopIconSvg({
      radius,
      inner,
      stroke,
      appendClass,
      colorOverride,
      platformCode: stop.platformCode,
      withHalo: !disableIconBorder,
    });

    return L.divIcon({
      html: iconSvg,
      iconSize: [radius * 2, radius * 2],
      className: getStopIconClassName(mode, true),
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
  stopStatus: PropTypes.string,
};
