import PropTypes from 'prop-types';
import React from 'react';
import mapProps from 'recompose/mapProps';
import { FormattedMessage } from 'react-intl';

import Availability from './Availability';
import ComponentUsageExample from './ComponentUsageExample';

const CityBikeAvailability = mapProps(
  ({
    bikesAvailable,
    totalSpaces,
    fewAvailableCount,
    type,
    useSpacesAvailable,
  }) => {
    const total = Number.isNaN(totalSpaces) ? 0 : totalSpaces;
    const available = Number.isNaN(bikesAvailable) ? 0 : bikesAvailable;

    return {
      available,
      total,
      fewAvailableCount,
      text: (
        <p className="sub-header-h4 availability-header">
          <FormattedMessage
            id={
              type === 'scooter' ? 'scooter-availability' : 'bike-availability'
            }
            defaultMessage="Bikes available at the station right now:"
          />
          {'\u00a0'}
          {available}
          {useSpacesAvailable && <React.Fragment>/{total}</React.Fragment>}
        </p>
      ),
      showStatusBar: useSpacesAvailable,
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
        type="citybike"
        useSpacesAvailable
      />
    </ComponentUsageExample>
  </div>
);

CityBikeAvailability.propTypes = {
  bikesAvailable: PropTypes.number.isRequired,
  totalSpaces: PropTypes.number.isRequired,
  fewAvailableCount: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  useSpacesAvailable: PropTypes.bool.isRequired,
};

export default CityBikeAvailability;
