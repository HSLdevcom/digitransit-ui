import { FormattedMessage, intlShape } from 'react-intl';
import Link from 'found/Link';
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import {
  BIKEAVL_UNKNOWN,
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
  getCitybikeCapacity,
  hasStationCode,
} from '../util/citybikes';

import withBreakpoint from '../util/withBreakpoint';
import Icon from './Icon';
import { PREFIX_BIKESTATIONS } from '../util/path';
import {
  getCityBikeAvailabilityIndicatorColor,
  getCityBikeAvailabilityTextColor,
} from '../util/legUtils';

function CityBikeLeg(
  { stationName, bikeRentalStation, returnBike = false, breakpoint },
  { config, intl },
) {
  if (!bikeRentalStation) {
    return null;
  }
  const networkConfig = getCityBikeNetworkConfig(
    getCityBikeNetworkId(bikeRentalStation.networks),
    config,
  );
  const formFactor = networkConfig.type || 'citybike';

  // eslint-disable-next-line no-nested-ternary
  const id = returnBike ? `return-${formFactor}-to` : `rent-${formFactor}-at`;
  const legDescription = (
    <span className="citybike-leg-header">
      <FormattedMessage id={id} defaultMessage="Fetch a bike" />
    </span>
  );
  const citybikeicon = getCityBikeNetworkIcon(networkConfig);
  const availabilityIndicatorColor = getCityBikeAvailabilityIndicatorColor(
    bikeRentalStation.bikesAvailable,
    config,
  );
  const availabilityTextColor = getCityBikeAvailabilityTextColor(
    bikeRentalStation.bikesAvailable,
    config,
  );
  const mobileReturn = breakpoint === 'small' && returnBike;
  const citybikeCapacity = getCitybikeCapacity(
    config,
    bikeRentalStation?.networks[0],
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
                  ? bikeRentalStation.bikesAvailable
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
                id: `${formFactor}-station-no-id`,
                defaultMessage: 'Bike station',
              })}
              {hasStationCode(bikeRentalStation) && (
                <span className="itinerary-stop-code">
                  {bikeRentalStation.stationId}
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="link-to-stop">
          <Link to={`/${PREFIX_BIKESTATIONS}/${bikeRentalStation.stationId}`}>
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
CityBikeLeg.propTypes = {
  bikeRentalStation: PropTypes.object,
  stationName: PropTypes.string,
  returnBike: PropTypes.bool,
  breakpoint: PropTypes.string,
};
CityBikeLeg.contextTypes = {
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};
const connectedComponent = withBreakpoint(CityBikeLeg);
export { connectedComponent as default, CityBikeLeg as Component };
