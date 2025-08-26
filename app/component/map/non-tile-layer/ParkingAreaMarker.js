import React from 'react';
import { routerShape } from 'found';
import { default as L } from 'leaflet';
import PropTypes from 'prop-types';
import { getCaseRadius } from '../../../util/mapIconUtils';
import { PREFIX_BIKEPARK, PREFIX_CARPARK } from '../../../util/path';
import { locationShape } from '../../../util/shapes';
import Icon from '../../Icon';
import GenericMarker from '../GenericMarker';

const ParkingAreaMarker = ({ position, type, liipiId }, { router }) => {
  const getIcon = zoom => {
    const icon = Icon.asString({ img: `icon-icon_${type}-park` });

    const iconSize = Math.max(getCaseRadius(zoom) * 3, 18);

    return L.divIcon({
      html: icon,
      iconSize: [iconSize, iconSize],
      iconAnchor: [iconSize / 2, iconSize / 2],
      className: 'parking',
    });
  };

  const redirectToLiipiPage = () => {
    router.push(
      `/${
        type === 'bike' ? PREFIX_BIKEPARK : PREFIX_CARPARK
      }/${encodeURIComponent(liipiId)}`,
    );
  };

  return (
    <GenericMarker
      position={position}
      getIcon={getIcon}
      zIndexOffset={12000}
      onClick={redirectToLiipiPage}
    />
  );
};

ParkingAreaMarker.propTypes = {
  position: locationShape.isRequired,
  type: PropTypes.oneOf(['bike', 'car']).isRequired,
  liipiId: PropTypes.string.isRequired,
};

ParkingAreaMarker.contextTypes = {
  router: routerShape.isRequired,
};

export default ParkingAreaMarker;
