import PropTypes from 'prop-types';
import React from 'react';
import mapProps from 'recompose/mapProps';
import { FormattedMessage } from 'react-intl';

import Availability from './Availability';

function getText(network, available) {
  if (available > -1) {
    return (
      <p className="sub-header-h4 availability-header">
        <FormattedMessage
          id={`${network}-availability`}
          defaultMessage="Bikes available at the station right now"
        />
        {'\u00a0'}
        <span className="available-bikes">{`(${available})`}</span>
      </p>
    );
  }
  return '';
}

const CityBikeAvailability = mapProps(
  ({
    disabled,
    bikesAvailable,
    totalSpaces,
    fewAvailableCount,
    fewerAvailableCount,
    useSpacesAvailable,
    networks,
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
    const n = networks || [];
    const network = n[0] || 'citybike';
    return {
      available,
      total,
      fewAvailableCount,
      fewerAvailableCount,
      text: getText(network, available),
      showStatusBar: false,
    };
  },
)(Availability);

CityBikeAvailability.displayName = 'CityBikeAvailability';

CityBikeAvailability.propTypes = {
  bikesAvailable: PropTypes.number.isRequired,
  totalSpaces: PropTypes.number.isRequired,
  fewAvailableCount: PropTypes.number.isRequired,
  networks: PropTypes.array,
  useSpacesAvailable: PropTypes.bool.isRequired,
};
CityBikeAvailability.defaultProps = {
  type: 'citybike',
};

export default CityBikeAvailability;
