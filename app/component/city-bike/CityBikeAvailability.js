import React from 'react';
import cx from 'classnames';

import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from '../documentation/ComponentUsageExample';
import config from '../../config';

const CityBikeAvailability = (props) => {
  let availablepct = 100 * props.bikesAvailable / props.totalSpaces;

  const availableClass = (() => {
    if (availablepct === 0) {
      return 'available-none';
    } else if (props.bikesAvailable <= config.cityBike.fewAvailableCount) {
      return 'available-few';
    }
    return 'available-more';
  })();

  const totalClass = availablepct === 100 ? 'available-more' : 'available-none';

  const separator = (availablepct > 0 && availablepct < 100) && 'separate';

  if (availablepct < 5) {
    availablepct = 5;
  }

  if (availablepct > 95) {
    availablepct = 95;
  }

  return (
    <div className="city-bike-availability-container">
      <p className="sub-header-h4 bike-availability-header">
        <FormattedMessage
          id="bike-availability"
          defaultMessage="Bikes available"
        />
        {'\u00a0'}
        ({isNaN(props.bikesAvailable) ? 0 : props.bikesAvailable}/
         {isNaN(props.totalSpaces) ? 0 : props.totalSpaces})
      </p>
      <div className="row">
        <div
          className={cx('city-bike-column', availableClass, separator)}
          style={{ width: `${availablepct}%` }}
        />
        <div
          className={cx('city-bike-column', totalClass, separator)}
          style={{ width: `${100 - availablepct}%` }}
        />
      </div>
    </div>
  );
};

CityBikeAvailability.displayName = 'CityBikeAvailability';

CityBikeAvailability.description = (
  <div>
    <p>
      Renders information about citybike availability
    </p>
    <ComponentUsageExample description="">
      <CityBikeAvailability bikesAvailable={1} totalSpaces={3} />
    </ComponentUsageExample>
  </div>);

CityBikeAvailability.propTypes = {
  bikesAvailable: React.PropTypes.number.isRequired,
  totalSpaces: React.PropTypes.number.isRequired,
};

export default CityBikeAvailability;
