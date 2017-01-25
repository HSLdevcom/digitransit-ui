import React from 'react';
import mapProps from 'recompose/mapProps';
import { FormattedMessage } from 'react-intl';

import Availability from './Availability';
import ComponentUsageExample from './ComponentUsageExample';

const CityBikeAvailability = mapProps(({ bikesAvailable, totalSpaces, fewAvailableCount }) => ({
  available: bikesAvailable,
  total: totalSpaces,
  fewAvailableCount,
  text: (
    <p className="sub-header-h4 availability-header">
      <FormattedMessage id="bike-availability" defaultMessage="Bikes available" />
      {'\u00a0'}
      ({isNaN(bikesAvailable) ? 0 : bikesAvailable}/
      {isNaN(totalSpaces) ? 0 : totalSpaces})
    </p>
  ),
}))(Availability);

CityBikeAvailability.displayName = 'CityBikeAvailability';

CityBikeAvailability.description = () =>
  <div>
    <p>Renders information about citybike availability</p>
    <ComponentUsageExample description="">
      <CityBikeAvailability bikesAvailable={1} totalSpaces={3} fewAvailableCount={3} />
    </ComponentUsageExample>
  </div>;

CityBikeAvailability.propTypes = {
  bikesAvailable: React.PropTypes.number.isRequired,
  totalSpaces: React.PropTypes.number.isRequired,
  fewAvailableCount: React.PropTypes.number.isRequired,
};

export default CityBikeAvailability;
