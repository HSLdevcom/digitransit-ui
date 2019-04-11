import PropTypes from 'prop-types';
import React from 'react';

import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import { cityBikeUrl as exampleUrl } from './ExampleData';

const CityBikeUse = ({ url }) => (
  <div className="city-bike-use-container">
    <p className="sub-header-h4 text-center">
      <FormattedMessage
        id="citybike-register-required"
        defaultMessage="To use city bikes, you need to register"
      />
    </p>
    <a href={url}>
      <button className="use-bike-button cursor-pointer">
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
      <CityBikeUse url={exampleUrl} />
    </ComponentUsageExample>
  </div>
);

CityBikeUse.propTypes = {
  url: PropTypes.string.isRequired,
};

export default CityBikeUse;
