import React from 'react';
import PropTypes from 'prop-types';
import { default as L } from 'leaflet';

import { locationShape } from '../../util/shapes';
import GenericMarker from './GenericMarker';
import { renderAsString, getIndexedIconFields } from '../../util/mapIconUtils';
import { WheelchairBoarding } from '../../constants';
import Icon from '../Icon';

export default function EntranceMarker({ position, code, entranceAccessible }) {
  const objs = [];

  const codeIndex = entranceAccessible === WheelchairBoarding.Possible ? 1 : 0;
  const entranceIndex = (code ? 1 : 0) + codeIndex;

  const getSubwayEntranceIcon = zoom => {
    const { iconSize, iconAnchor } = getIndexedIconFields(zoom, entranceIndex);
    return L.divIcon({
      html: renderAsString(<Icon img="icon_subway_entrance" />),
      iconSize,
      iconAnchor,
      className: 'map-subway-entrance-info-icon-metro',
    });
  };
  const getSubwayEntranceCodeIcon = zoom => {
    const { iconSize, iconAnchor } = getIndexedIconFields(zoom, codeIndex);
    return L.divIcon({
      html: renderAsString(<Icon img={`icon_subway_entrance_${code}`} />),
      iconSize,
      iconAnchor,
      className: 'map-subway-entrance-info-icon-metro',
    });
  };
  const getSubwayEntranceAccessibleIcon = zoom => {
    const { iconSize, iconAnchor } = getIndexedIconFields(zoom, 0);
    return L.divIcon({
      html: renderAsString(<Icon img="icon_wheelchair_filled" />),
      iconSize,
      iconAnchor,
      className: 'map-subway-entrance-info-icon-metro',
    });
  };

  objs.push(
    <GenericMarker
      key={`icon_subway_entrance_lat_${position.lat}_lon_${position.lon}`}
      position={position}
      getIcon={getSubwayEntranceIcon}
      zIndexOffset={13100}
    />,
  );
  if (code) {
    objs.push(
      <GenericMarker
        key={`icon_subway_entrance_lat_${position.lat}_lon_${position.lon}_code_${code}`}
        position={position}
        getIcon={getSubwayEntranceCodeIcon}
        zIndexOffset={13100}
      />,
    );
  }
  if (entranceAccessible === WheelchairBoarding.Possible) {
    objs.push(
      <GenericMarker
        key={`icon_subway_entrance_lat_${position.lat}_lon_${position.lon}_wheelchairboarding_${entranceAccessible}`}
        position={position}
        getIcon={getSubwayEntranceAccessibleIcon}
        zIndexOffset={13100}
      />,
    );
  }
  return <div>{objs}</div>;
}

EntranceMarker.propTypes = {
  position: locationShape.isRequired,
  code: PropTypes.string,
  entranceAccessible: PropTypes.oneOf(Object.values(WheelchairBoarding)),
};

EntranceMarker.defaultProps = {
  code: undefined,
  entranceAccessible: WheelchairBoarding.NoInformation,
};
