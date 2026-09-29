import PropTypes from 'prop-types';
import React from 'react';
import { useRouter } from 'found';
import { default as L } from 'leaflet';
import { TransportMode } from '../../../../utils/shared/constants';
import {
  vehicleRentalStationShape,
  rentalVehicleShape,
} from '../../../../utils/client/shapes';
import Icon from '../../Icon';
import GenericMarker from '../GenericMarker';
import {
  BIKEAVL_UNKNOWN,
  getRentalNetworkConfig,
  getRentalNetworkIcon,
  getVehicleCapacity,
} from '../../../../utils/shared/vehicleRentalUtils';
import {
  getVehicleAvailabilityIndicatorColor,
  getVehicleAvailabilityTextColor,
} from '../../../../utils/client/legUtils';

import {
  PREFIX_BIKESTATIONS,
  PREFIX_RENTALVEHICLES,
} from '../../../../utils/shared/path';
import { renderAsString } from '../../../../utils/client/mapIconUtils';
import IconBadge from '../../icon/IconBadge';
import { useConfigContext } from '../../../client/ConfigContext';

// Small icon for zoom levels <= 15
const smallIconSvg = `
  <svg viewBox="0 0 8 8">
    <circle class="stop-small" cx="4" cy="4" r="3" stroke-width="1"/>
  </svg>
`;

export default function VehicleMarker({
  showBikeAvailability = false,
  rental,
  transit = false,
  mode,
}) {
  const config = useConfigContext();
  const { router } = useRouter();

  const handleClick = (id, prefix) => {
    router.push(`/${prefix}/${encodeURIComponent(id)}`);
  };

  const getIcon = zoom => {
    const vehicleCapacity = getVehicleCapacity(config, rental?.network);
    const iconName = `${getRentalNetworkIcon(
      getRentalNetworkConfig(rental.network, config),
    )}-lollipop`;

    return !transit && zoom <= config.stopsSmallMaxZoom
      ? L.divIcon({
          html: smallIconSvg,
          iconSize: [8, 8],
          className: 'citybike cursor-pointer',
        })
      : L.divIcon({
          iconAnchor: [15, 40],
          html: showBikeAvailability
            ? renderAsString(
                <Icon
                  img={iconName}
                  className="city-bike-medium-size"
                  foreground={
                    <IconBadge
                      badgeFill={getVehicleAvailabilityIndicatorColor(
                        rental?.availableVehicles?.total,
                        config,
                      )}
                      badgeTextFill={getVehicleAvailabilityTextColor(
                        rental?.availableVehicles?.total,
                        config,
                      )}
                      badgeText={
                        vehicleCapacity !== BIKEAVL_UNKNOWN
                          ? rental?.availableVehicles?.total
                          : null
                      }
                    />
                  }
                />,
              )
            : renderAsString(
                <Icon img={iconName} className="city-bike-medium-size" />,
              ),
          iconSize: [20, 20],
          className: 'citybike cursor-pointer',
        });
  };

  return (
    <GenericMarker
      position={{
        lat: rental?.lat,
        lon: rental?.lon,
      }}
      onClick={() =>
        handleClick(
          rental.id,
          mode === TransportMode.Scooter
            ? PREFIX_RENTALVEHICLES
            : PREFIX_BIKESTATIONS,
        )
      }
      getIcon={getIcon}
      id={rental?.id}
    />
  );
}

VehicleMarker.displayName = 'VehicleMarker';

VehicleMarker.propTypes = {
  showBikeAvailability: PropTypes.bool,
  rental: PropTypes.oneOfType([vehicleRentalStationShape, rentalVehicleShape])
    .isRequired,
  transit: PropTypes.bool,
  mode: PropTypes.string.isRequired,
};
