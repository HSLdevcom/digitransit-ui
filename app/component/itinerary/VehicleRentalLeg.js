import { FormattedMessage, useIntl } from 'react-intl';
import Link from 'found/Link';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';

import {
  vehicleRentalStationShape,
  rentalVehicleShape,
} from '../../util/shapes';
import {
  BIKEAVL_UNKNOWN,
  getVehicleCapacity,
  getRentalNetworkConfig,
  getRentalNetworkIcon,
  hasVehicleRentalCode,
} from '../../util/vehicleRentalUtils';
import withBreakpoint from '../../util/withBreakpoint';
import Icon from '../Icon';
import { PREFIX_BIKESTATIONS } from '../../util/path';
import {
  getVehicleAvailabilityTextColor,
  getVehicleAvailabilityIndicatorColor,
} from '../../util/legUtils';
import ScooterLinkContainer from './ScooterLinkContainer';
import IconBadge from '../icon/IconBadge';
import { useConfigContext } from '../../configurations/ConfigContext';
import { splitGtfsId } from '../../util/gtfs';

function VehicleRentalLeg({
  stationName,
  isScooter = false,
  vehicleRentalStation,
  returnBike = false,
  breakpoint,
  rentalVehicle,
  nextLegMode,
  nearestScooters = [],
}) {
  const intl = useIntl();
  const config = useConfigContext();
  const { language } = config;

  if (!vehicleRentalStation && !isScooter) {
    return null;
  }

  const network =
    vehicleRentalStation?.rentalNetwork.networkId ||
    rentalVehicle?.rentalNetwork.networkId;

  const rentMessageId = isScooter ? 'rent-e-scooter-at' : 'rent-cycle-at';
  const returnMessageId = isScooter ? 'return-e-scooter-to' : 'return-cycle-to';
  const id = returnBike ? returnMessageId : rentMessageId;

  const legDescription = (
    <span
      className={cx('leg-header', returnBike && isScooter && 'scooter-return')}
      aria-hidden={isScooter} // scooter screen reader message is already defined elsewhere
    >
      <FormattedMessage id={id} defaultMessage="Fetch a bike" />
    </span>
  );

  const networkConfig = getRentalNetworkConfig(network, config);
  const vehicleIcon = getRentalNetworkIcon(networkConfig);

  const availabilityIndicatorColor = vehicleRentalStation
    ? getVehicleAvailabilityIndicatorColor(
        vehicleRentalStation.availableVehicles.total,
        config,
      )
    : null;

  const availabilityTextColor = vehicleRentalStation
    ? getVehicleAvailabilityTextColor(
        vehicleRentalStation.availableVehicles.total,
        config,
      )
    : null;

  const mobileReturn = breakpoint === 'small' && returnBike;

  const vehicleCapacity = vehicleRentalStation
    ? getVehicleCapacity(config, vehicleRentalStation?.rentalNetwork.networkId)
    : null;

  const rentalStationLink = `/${PREFIX_BIKESTATIONS}/${vehicleRentalStation?.stationId}`;

  return (
    <>
      {(!isScooter || (nextLegMode !== 'WALK' && isScooter)) && (
        <div
          className={cx(
            'itinerary-leg-row-with-link',
            (!isScooter || !returnBike) && 'withPadding',
          )}
        >
          {legDescription}
        </div>
      )}

      {vehicleRentalStation && (
        <div className="itinerary-transit-leg-route-with-link">
          <div className="itinerary-with-link">
            <div
              className={cx(
                'citybike-icon',
                { small: mobileReturn },
                isScooter && 'scooter-icon',
              )}
            >
              <Icon
                img={vehicleIcon}
                width={1.655}
                height={1.655}
                foreground={
                  <IconBadge
                    badgeText={
                      vehicleRentalStation &&
                      vehicleCapacity !== BIKEAVL_UNKNOWN &&
                      !returnBike
                        ? vehicleRentalStation?.availableVehicles.total
                        : ''
                    }
                    badgeFill={returnBike ? null : availabilityIndicatorColor}
                    badgeTextFill={returnBike ? null : availabilityTextColor}
                  />
                }
              />
            </div>

            <div className="itinerary-with-link-text-container">
              <span className={cx('headsign', isScooter && 'scooter-headsign')}>
                <Link
                  style={{ textDecoration: 'none', color: 'black' }}
                  to={rentalStationLink}
                >
                  {stationName}
                </Link>
              </span>

              <span className="citybike-station-text">
                {intl.formatMessage({
                  id: 'citybike-station-no-id',
                  defaultMessage: 'Bike station',
                })}
                {vehicleRentalStation &&
                  hasVehicleRentalCode(vehicleRentalStation.stationId) && (
                    <span className="itinerary-stop-code">
                      {splitGtfsId(vehicleRentalStation?.stationId).entityId}
                    </span>
                  )}
              </span>
            </div>
          </div>

          <div className="link-to-stop">
            <Link to={rentalStationLink}>
              <Icon img="icon_arrow-collapse--right" height={1.3} width={1.3} />
            </Link>
          </div>
        </div>
      )}

      {rentalVehicle && !returnBike && isScooter && (
        <ScooterLinkContainer
          rentalVehicle={rentalVehicle}
          language={language}
          mobileReturn={mobileReturn}
        />
      )}

      {nearestScooters &&
        !returnBike &&
        isScooter &&
        nearestScooters.map(nearestScooter => (
          <ScooterLinkContainer
            key={`nearestScooter-${nearestScooter.node.place.vehicleId}`}
            rentalVehicle={nearestScooter.node.place}
            language={language}
            mobileReturn={mobileReturn}
          />
        ))}
    </>
  );
}

VehicleRentalLeg.propTypes = {
  vehicleRentalStation: vehicleRentalStationShape,
  stationName: PropTypes.string,
  isScooter: PropTypes.bool,
  returnBike: PropTypes.bool,
  breakpoint: PropTypes.string,
  rentalVehicle: rentalVehicleShape,
  nextLegMode: PropTypes.string,
  nearestScooters: PropTypes.arrayOf(rentalVehicleShape),
};

export default withBreakpoint(VehicleRentalLeg);
