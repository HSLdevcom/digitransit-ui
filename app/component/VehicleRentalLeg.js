import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  BIKEAVL_UNKNOWN,
  getVehicleCapacity,
  getVehicleRentalStationNetworkConfig,
  getVehicleRentalStationNetworkIcon,
  hasStationCode,
} from '../util/vehicleRentalUtils';

import withBreakpoint from '../util/withBreakpoint';
import Icon from './Icon';
import { PREFIX_BIKESTATIONS, PREFIX_RENTALVEHICLES } from '../util/path';
import {
  getVehicleAvailabilityTextColor,
  getVehicleAvailabilityIndicatorColor,
} from '../util/legUtils';
import { getIdWithoutFeed } from '../util/feedScopedIdUtils';

function VehicleRentalLeg(
  {
    stationName,
    isScooter,
    vehicleRentalStation,
    returnBike = false,
    breakpoint,
    rentalVehicle,
  },
  { config, intl },
) {
  if (!vehicleRentalStation && !isScooter) {
    return null;
  }
  const network = vehicleRentalStation?.network || rentalVehicle?.network;
  // eslint-disable-next-line no-nested-ternary
  const rentMessageId = isScooter ? 'rent-e-scooter-at' : 'rent-cycle-at';
  const returnMessageId = isScooter ? 'return-e-scooter-to' : 'return-cycle-to';
  const id = returnBike ? returnMessageId : rentMessageId;
  const legDescription = (
    <span className="citybike-leg-header">
      <FormattedMessage id={id} defaultMessage="Fetch a bike" />
    </span>
  );
  const vehicleIcon = getVehicleRentalStationNetworkIcon(
    getVehicleRentalStationNetworkConfig(network, config),
  );
  const availabilityIndicatorColor = vehicleRentalStation
    ? getVehicleAvailabilityIndicatorColor(
        vehicleRentalStation.vehiclesAvailable,
        config,
      )
    : null;
  const availabilityTextColor = vehicleRentalStation
    ? getVehicleAvailabilityTextColor(
        vehicleRentalStation.vehiclesAvailable,
        config,
      )
    : null;
  const mobileReturn = breakpoint === 'small' && returnBike;
  const vehicleCapacity = vehicleRentalStation
    ? getVehicleCapacity(config, vehicleRentalStation?.network)
    : null;
  const scooterHeadsign = (
    <FormattedMessage
      id="open-operator-app"
      values={{ operator: network }}
      defaultMessage="Open the app to use a scooter"
    />
  );
  const link = isScooter
    ? `/${PREFIX_RENTALVEHICLES}/${rentalVehicle?.vehicleId}` // TO DO: link from data
    : `/${PREFIX_BIKESTATIONS}/${vehicleRentalStation?.stationId}`;
  return (
    <>
      <div className="itinerary-leg-row-bike">{legDescription}</div>
      {(!isScooter || (isScooter && !returnBike)) && (
        <div className="itinerary-transit-leg-route-bike">
          <div className="citybike-itinerary">
            <div className={cx('citybike-icon', { small: mobileReturn })}>
              {isScooter ? (
                <Icon img={vehicleIcon} width={1.655} height={1.655} />
              ) : (
                <Icon
                  img={vehicleIcon}
                  width={1.655}
                  height={1.655}
                  badgeText={
                    vehicleRentalStation &&
                    vehicleCapacity !== BIKEAVL_UNKNOWN &&
                    !returnBike
                      ? vehicleRentalStation?.vehiclesAvailable
                      : ''
                  }
                  badgeFill={returnBike ? null : availabilityIndicatorColor}
                  badgeTextFill={returnBike ? null : availabilityTextColor}
                />
              )}
            </div>
            <div className="citybike-itinerary-text-container">
              <span className={cx('headsign', isScooter && 'scooter-headsign')}>
                <Link style={{ textDecoration: 'none' }} to={link}>
                  {isScooter ? scooterHeadsign : stationName}
                </Link>
              </span>

              {!isScooter && (
                <span className="citybike-station-text">
                  {intl.formatMessage({
                    id: 'citybike-station-no-id',
                    defaultMessage: 'Bike station',
                  })}
                  {vehicleRentalStation &&
                    hasStationCode(vehicleRentalStation) && (
                      <span className="itinerary-stop-code">
                        {getIdWithoutFeed(vehicleRentalStation?.stationId)}
                      </span>
                    )}
                </span>
              )}
            </div>
          </div>
          {isScooter ? (
            <div className="link-to-e-scooter-operator">
              <Link to={link}>
                <Icon
                  img="icon-icon_square_right_corner_arrow"
                  color="#007ac9"
                  height={1}
                  width={1}
                />
              </Link>
            </div>
          ) : (
            <div className="link-to-stop">
              <Link to={link}>
                <Icon
                  img="icon-icon_arrow-collapse--right"
                  color="#007ac9"
                  height={1.3}
                  width={1.3}
                />
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
}

VehicleRentalLeg.propTypes = {
  vehicleRentalStation: PropTypes.object,
  stationName: PropTypes.string.isRequired,
  isScooter: PropTypes.bool,
  returnBike: PropTypes.bool,
  breakpoint: PropTypes.string,
  rentalVehicle: PropTypes.object,
};

VehicleRentalLeg.defaultProps = {
  vehicleRentalStation: undefined,
  isScooter: false,
  returnBike: false,
  breakpoint: undefined,
};

VehicleRentalLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};
const connectedComponent = withBreakpoint(VehicleRentalLeg);
export { connectedComponent as default, VehicleRentalLeg as Component };
