import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon';
import { locationShape } from '../../util/shapes';
import GenericMarker from './GenericMarker';
import { isBrowser } from '../../util/browser';
import { getCaseRadius } from '../../util/mapIconUtils';

let L;

/* eslint-disable global-require */
if (isBrowser) {
  L = require('leaflet');
}

export default function EntranceMarker({ position, code }) {
  const objs = [];

  const getSubwayIcon = zoom => {
    const iconId = `icon-icon_subway_entrance`;
    const icon = Icon.asString({ img: iconId });

    const iconSize = Math.max(getCaseRadius(zoom) * 2, 8);

    return L.divIcon({
      html: icon,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, 2.5 * iconSize + 1],
      className: 'map-subway-entrance-info-icon-metro',
    });
  };

  const getCodeIcon = zoom => {
    const iconId = `icon-icon_subway_entrance_${code}`;
    const icon = Icon.asString({ img: iconId });
    const iconSize = Math.max(getCaseRadius(zoom) * 2, 8);

    return L.divIcon({
      html: icon,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, 1.5 * iconSize],
      className: 'map-subway-entrance-info-icon-metro',
    });
  };

  objs.push(
    <GenericMarker
      key="icon-icon_subway_entrance"
      position={position}
      getIcon={getSubwayIcon}
    />,
  );

  if (code) {
    objs.push(
      <GenericMarker
        key="icon-icon_subway_entrance_code"
        position={position}
        getIcon={getCodeIcon}
      />,
    );
  }
  return <div>{objs}</div>;
}

EntranceMarker.propTypes = {
  position: locationShape.isRequired,
  code: PropTypes.string,
};

EntranceMarker.defaultProps = {
  code: undefined,
};
