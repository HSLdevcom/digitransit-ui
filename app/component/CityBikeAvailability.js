import PropTypes from 'prop-types';
import React from 'react';
import mapProps from 'recompose/mapProps';
import { FormattedMessage } from 'react-intl';

import Availability from './Availability';
import ComponentUsageExample from './ComponentUsageExample';

const CityBikeAvailability = mapProps(
  ({ bikesAvailable, totalSpaces, fewAvailableCount }) => {
    const total = Number.isNaN(totalSpaces) ? 0 : totalSpaces;
    const available = Number.isNaN(bikesAvailable) ? 0 : bikesAvailable;

    return {
      available,
      total,
      fewAvailableCount,
      text:
        total === 0 ? (
          <p className="sub-header-h4 availability-header">
            <FormattedMessage
              id="bike-station-off"
              defaultMessage="Bike station closed"
            />
          </p>
        ) : (
          <p className="sub-header-h4 availability-header">
            <FormattedMessage
              id="bike-availability"
              defaultMessage="Bikes available at the station right now"
            />
            {'\u00a0'}
            ({available}/{total})
          </p>
        ),
    };
  },
)(Availability);

CityBikeAvailability.displayName = 'CityBikeAvailability';

CityBikeAvailability.description = () => (
  <div>
    <p>Renders information about citybike availability</p>
    <ComponentUsageExample description="">
      <CityBikeAvailability
        bikesAvailable={1}
        totalSpaces={3}
        fewAvailableCount={3}
      />
    </ComponentUsageExample>
  </div>
);

CityBikeAvailability.propTypes = {
  bikesAvailable: PropTypes.number.isRequired,
  totalSpaces: PropTypes.number.isRequired,
  fewAvailableCount: PropTypes.number.isRequired,
};

export default CityBikeAvailability;
