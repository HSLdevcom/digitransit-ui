import React from 'react';

import { FormattedMessage } from 'react-intl';

import ComponentUsageExample from './ComponentUsageExample';
import { lang as exampleLang } from './ExampleData';

const CityBikeUse = ({ lang }, context) => (
  <div className="city-bike-use-container">
    <p className="sub-header-h4 text-center">
      <FormattedMessage
        id="citybike-register-required"
        defaultMessage="Citybikes requires registration"
      />
    </p>
    <a href={context.config.cityBike.useUrl[lang]}>
      <button className="use-bike-button cursor-pointer">
        <FormattedMessage id="use-citybike" defaultMessage="Use a bike" />
      </button>
    </a>
  </div>);

CityBikeUse.displayName = 'CityBikeUse';

CityBikeUse.description = () =>
  <div>
    <p>Renders use citybike component</p>
    <ComponentUsageExample description="">
      <CityBikeUse lang={exampleLang} />
    </ComponentUsageExample>
  </div>;

CityBikeUse.propTypes = {
  lang: React.PropTypes.string.isRequired,
};

CityBikeUse.contextTypes = {
  config: React.PropTypes.object.isRequired,
};

export default CityBikeUse;
