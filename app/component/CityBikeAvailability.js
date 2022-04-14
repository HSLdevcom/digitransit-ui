import PropTypes from 'prop-types';
import React from 'react';
import mapProps from 'recompose/mapProps';
import { FormattedMessage } from 'react-intl';

import Availability from './Availability';

const CityBikeAvailability = mapProps(
  ({
    disabled,
    bikesAvailable,
    totalSpaces,
    fewAvailableCount,
    fewerAvailableCount,
    type,
    useSpacesAvailable,
  }) => {
    const total = Number.isNaN(totalSpaces) ? 0 : totalSpaces;
    const available = Number.isNaN(bikesAvailable) ? 0 : bikesAvailable;
    if (disabled) {
      return {
        available,
        total,
        text: (
          <p className="sub-header-h4 availability-header">
            <FormattedMessage id="bike-station-disabled" />
          </p>
        ),
        showStatusBar: useSpacesAvailable,
      };
    }
    return {
      available,
      total,
      fewAvailableCount,
      fewerAvailableCount,
      text: (
        <p className="sub-header-h4 availability-header">
          <FormattedMessage
            id={
              type === 'scooter' ? 'scooter-availability' : 'bike-availability'
            }
            defaultMessage="Bikes available at the station right now"
          />
          {'\u00a0'}
          <span className="available-bikes">{available}</span>
          {useSpacesAvailable && <React.Fragment>/{total}</React.Fragment>}
        </p>
      ),
      showStatusBar: useSpacesAvailable,
    };
  },
)(Availability);

CityBikeAvailability.displayName = 'CityBikeAvailability';

CityBikeAvailability.propTypes = {
  bikesAvailable: PropTypes.number.isRequired,
  totalSpaces: PropTypes.number.isRequired,
  fewAvailableCount: PropTypes.number.isRequired,
  type: PropTypes.string,
  useSpacesAvailable: PropTypes.bool.isRequired,
};
CityBikeAvailability.defaultProps = {
  type: 'citybike',
};

export default CityBikeAvailability;
