import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  BIKEAVL_UNKNOWN,
  getCitybikeCapacity,
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
  hasStationCode,
} from '../util/vehicleRentalUtils';

import withBreakpoint from '../util/withBreakpoint';
import Icon from './Icon';
import { PREFIX_BIKESTATIONS } from '../util/path';
import {
  getVehicleAvailabilityTextColor,
  getCityVehicleAvailabilityIndicatorColor,
} from '../util/legUtils';
import { getIdWithoutFeed } from '../util/feedScopedIdUtils';

function VehicleRentalLeg(
  {
    stationName,
    isScooter,
    vehicleRentalStation,
    returnBike = false,
    breakpoint,
  },
  { config, intl },
) {
  if (!vehicleRentalStation) {
    return null;
  }
  // eslint-disable-next-line no-nested-ternary
  const id = returnBike
    ? isScooter
      ? 'return-scooter-to'
      : 'return-cycle-to'
    : isScooter
    ? 'rent-scooter-at'
    : 'rent-cycle-at';
  const legDescription = (
    <span className="citybike-leg-header">
      <FormattedMessage id={id} defaultMessage="Fetch a bike" />
    </span>
  );
  const citybikeicon = getCityBikeNetworkIcon(
    getCityBikeNetworkConfig(
      getCityBikeNetworkId(vehicleRentalStation.network),
      config,
    ),
  );
  const availabilityIndicatorColor = getCityVehicleAvailabilityIndicatorColor(
    vehicleRentalStation.vehiclesAvailable,
    config,
  );
  const availabilityTextColor = getVehicleAvailabilityTextColor(
    vehicleRentalStation.vehiclesAvailable,
    config,
  );
  const mobileReturn = breakpoint === 'small' && returnBike;
  const citybikeCapacity = getCitybikeCapacity(
    config,
    vehicleRentalStation?.network,
  );
  return (
    <>
      <div className="itinerary-leg-row-bike">{legDescription}</div>
      <div className="itinerary-transit-leg-route-bike">
        <div className="citybike-itinerary">
          <div className={cx('citybike-icon', { small: mobileReturn })}>
            <Icon
              img={citybikeicon}
              width={1.655}
              height={1.655}
              badgeText={
                citybikeCapacity !== BIKEAVL_UNKNOWN && !returnBike
                  ? vehicleRentalStation.vehiclesAvailable
                  : null
              }
              badgeFill={returnBike ? null : availabilityIndicatorColor}
              badgeTextFill={returnBike ? null : availabilityTextColor}
            />
          </div>
          <div className="citybike-itinerary-text-container">
            <span className="headsign"> {stationName}</span>
            <span className="citybike-station-text">
              {intl.formatMessage({
                id: 'citybike-station-no-id',
                defaultMessage: 'Bike station',
              })}
              {hasStationCode(vehicleRentalStation) && (
                <span className="itinerary-stop-code">
                  {getIdWithoutFeed(vehicleRentalStation.stationId)}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="link-to-stop">
          <Link
            to={`/${PREFIX_BIKESTATIONS}/${vehicleRentalStation.stationId}`}
          >
            <Icon
              img="icon-icon_arrow-collapse--right"
              color="#007ac9"
              height={1.3}
              width={1.3}
            />
          </Link>
        </div>
      </div>
    </>
  );
}

VehicleRentalLeg.propTypes = {
  vehicleRentalStation: PropTypes.object,
  stationName: PropTypes.string,
  isScooter: PropTypes.bool,
  returnBike: PropTypes.bool,
  breakpoint: PropTypes.string,
};
VehicleRentalLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};
const connectedComponent = withBreakpoint(VehicleRentalLeg);
export { connectedComponent as default, VehicleRentalLeg as Component };
