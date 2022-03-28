import cx from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import Icon from '../Icon';
import IconMarker from './IconMarker';
import ViaPointPopup from './popups/ViaPointPopup';

import GenericMarker from './GenericMarker';
import { isBrowser } from '../../util/browser';
import {
  getCaseRadius,
  getStopRadius,
  getHubRadius,
} from '../../util/mapIconUtils';

let L;
/* eslint-disable global-require */
if (isBrowser) {
  L = require('leaflet');
}
/* eslint-enable global-require */

const getIcon = zoom => {
  const scale = 1.5;
  const calcZoom = Math.max(zoom, 15);
  const radius = getCaseRadius(calcZoom) * scale;
  const stopRadius = getStopRadius(calcZoom) * scale;
  const hubRadius = getHubRadius(calcZoom) * scale;

  const inner = (stopRadius + hubRadius) / 2;
  const stroke = stopRadius - hubRadius;
  const iconSvg = `
    <svg viewBox="0 0 ${radius * 2} ${radius * 2}">
      <circle class="stop" cx="${radius}" cy="${radius}" r="${inner}" stroke-width="${stroke}"/>
    </svg>
  `;
  return L.divIcon({
    html: iconSvg,
    iconSize: [radius * 2, radius * 2],
    iconAnchor: [radius, radius * 1.2],
    className: 'walk',
  });
};

export default function LocationMarker({
  position,
  className,
  isLarge,
  type,
  streetMode,
  disabled,
}) {
  const getValidType = markertype => {
    switch (markertype) {
      case 'from':
        return 'from';
      case 'to':
        return 'to';
      case 'via':
      default:
        return 'via';
    }
  };
  const validType = getValidType(type);
  const sideLength = isLarge ? 30 : 24;
  const isOnFoot = streetMode === 'walk' || streetMode === 'bike';
  return (
    <>
      {isOnFoot && (
        <GenericMarker
          position={position}
          className={cx('leg-foot', validType)}
          getIcon={getIcon}
        />
      )}
      <IconMarker
        position={position}
        className={cx(validType, className)}
        icon={{
          className: cx(validType, className),
          element: (
            <Icon
              img={`icon-icon_mapMarker-${validType}-map`}
              color={disabled ? '#bbbbbb' : null}
            />
          ),
          iconAnchor: [sideLength / 2, sideLength],
          iconSize: [sideLength, sideLength],
        }}
      >
        {validType === 'via' && (
          <ViaPointPopup
            lat={position.lat}
            lon={position.lon}
            key={`${position.lat}${position.lon}`}
          />
        )}
      </IconMarker>
    </>
  );
}

LocationMarker.propTypes = {
  position: IconMarker.propTypes.position,
  className: PropTypes.string,
  isLarge: PropTypes.bool,
  type: PropTypes.oneOf(['from', 'via', 'to']),
  streetMode: PropTypes.string,
  disabled: PropTypes.bool,
};

LocationMarker.defaultProps = {
  className: undefined,
  isLarge: false,
  type: 'via',
  streetMode: '',
  disabled: false,
};
