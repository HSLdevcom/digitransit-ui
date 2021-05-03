import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';
import React from 'react';
import PropTypes from 'prop-types';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
} from '../util/citybikes';
import Icon from './Icon';
import { PREFIX_BIKESTATIONS } from '../util/path';
import {
  getCityBikeAvailabilityIndicatorColor,
  getCityBikeAvailabilityTextColor,
} from '../util/legUtils';

function CityBikeLeg(
  { stationName, isScooter, bikeRentalStation, returnBike = false },
  { config, intl },
) {
  if (!bikeRentalStation) {
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
      getCityBikeNetworkId(bikeRentalStation.networks),
      config,
    ),
  );
  const availabilityIndicatorColor = getCityBikeAvailabilityIndicatorColor(
    bikeRentalStation.bikesAvailable,
    config,
  );
  const availabilityTextColor = getCityBikeAvailabilityTextColor(
    bikeRentalStation.bikesAvailable,
    config,
  );
  return (
    <>
      <div className="itinerary-leg-row-bike">{legDescription}</div>
      <div className="itinerary-transit-leg-route-bike">
        <div className="citybike-itinerary">
          <span className="citybike-icon">
            <Icon
              img={citybikeicon}
              width={2}
              height={2}
              badgeText={bikeRentalStation.bikesAvailable}
              badgeFill={availabilityIndicatorColor}
              badgeTextFill={availabilityTextColor}
            />
          </span>
          <span className="headsign"> {stationName}</span>
          <span className="citybike-station-text">
            {intl.formatMessage({
              id: 'citybike-station-no-id',
              defaultMessage: 'Bike station',
            })}
            <span className="itinerary-stop-code">
              {bikeRentalStation.stationId}
            </span>
          </span>
        </div>
        <span className="link-to-stop">
          <Link to={`/${PREFIX_BIKESTATIONS}/${bikeRentalStation.stationId}`}>
            <Icon
              img="icon-icon_arrow-collapse--right"
              color="#007ac9"
              height={1.3}
              width={1.3}
            />
          </Link>
        </span>
      </div>
    </>
  );
}
CityBikeLeg.propTypes = {
  bikeRentalStation: PropTypes.object,
  stationName: PropTypes.string,
  isScooter: PropTypes.bool,
  returnBike: PropTypes.bool,
};
CityBikeLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default CityBikeLeg;
