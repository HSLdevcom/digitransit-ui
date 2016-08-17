import React from 'react';
import Availability from '../card/Availability';
import mapProps from 'recompose/mapProps';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { FormattedMessage } from 'react-intl';
import config from '../../config';

const CityBikeAvailability = mapProps(({ bikesAvailable, totalSpaces }) => ({
  available: bikesAvailable,
  total: totalSpaces,
  fewAvailableCount: config.cityBike.fewAvailableCount,
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

CityBikeAvailability.description = (
  <div>
    <p>Renders information about citybike availability</p>
    <ComponentUsageExample description="">
      <CityBikeAvailability bikesAvailable={1} totalSpaces={3} />
    </ComponentUsageExample>
  </div>
);

CityBikeAvailability.propTypes = {
  bikesAvailable: React.PropTypes.number.isRequired,
  totalSpaces: React.PropTypes.number.isRequired,
};

export default CityBikeAvailability;
