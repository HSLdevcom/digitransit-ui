import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import { cityBikeUrl as exampleUrl } from './ExampleData';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const CityBikeUse = ({ url, type }) => (
  <div className="city-bike-use-container">
    <p className="sub-header-h4 text-center">
      <FormattedMessage
        id={
          type === 'scooter'
            ? 'scooter-register-required'
            : 'citybike-register-required'
        }
        defaultMessage="To use city bikes, you need to register"
      />
    </p>
    <a href={url}>
      <button
        className="use-bike-button cursor-pointer"
        onClick={() => {
          addAnalyticsEvent({
            category: 'Map',
            action: 'OpenCityBikesRegistrationFromStationPopup',
            name: null,
          });
        }}
      >
        <FormattedMessage id="use-citybike" defaultMessage="Start using" />
      </button>
    </a>
  </div>
);

CityBikeUse.displayName = 'CityBikeUse';

CityBikeUse.description = () => (
  <div>
    <p>Renders use citybike component</p>
    <ComponentUsageExample description="">
      <CityBikeUse url={exampleUrl} type="citybike" />
    </ComponentUsageExample>
  </div>
);

CityBikeUse.propTypes = {
  url: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
};

export default CityBikeUse;
