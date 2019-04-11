import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import CityBikeAvailability from './CityBikeAvailability';
import CityBikeUse from './CityBikeUse';
import { getCityBikeUrl } from '../util/citybikes';
import ComponentUsageExample from './ComponentUsageExample';
import { station as exampleStation, lang as exampleLang } from './ExampleData';

const CityBikeContent = ({ station, lang }, { config }) => (
  <div className="city-bike-container">
    {station.state !== 'Station on' ? (
      <p className="sub-header-h4 availability-header">
        <FormattedMessage
          id="citybike_off"
          defaultMessage="Bike station closed"
        />
      </p>
    ) : (
      <CityBikeAvailability
        bikesAvailable={station.bikesAvailable}
        totalSpaces={station.bikesAvailable + station.spacesAvailable}
        fewAvailableCount={config.cityBike.fewAvailableCount}
      />
    )}
    {config.transportModes.citybike.availableForSelection &&
      getCityBikeUrl(station.networks, lang, config) && (
        <CityBikeUse url={getCityBikeUrl(station.networks, lang, config)} />
      )}
    {!config.transportModes.citybike.availableForSelection && (
      <div className="city-bike-use-container">
        <p className="sub-header-h4 text-center">
          <FormattedMessage
            id="citybike-off-season"
            defaultMessage="City bike stations will be opened again next spring"
          />
        </p>
      </div>
    )}
  </div>
);

CityBikeContent.displayName = 'CityBikeContent';

CityBikeContent.description = () => (
  <div>
    <p>Renders content of a citybike card</p>
    <ComponentUsageExample description="">
      <CityBikeContent station={exampleStation} lang={exampleLang} />
    </ComponentUsageExample>
  </div>
);

CityBikeContent.propTypes = {
  station: PropTypes.object.isRequired,
  lang: PropTypes.string.isRequired,
};

CityBikeContent.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default CityBikeContent;
