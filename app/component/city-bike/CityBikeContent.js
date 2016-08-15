import React from 'react';
import CityBikeAvailability from './CityBikeAvailability';
import CityBikeUse from './CityBikeUse';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import { station as exampleStation } from '../documentation/ExampleData';

const CityBikeContent = ({ station, lang }) => (
  <div className="city-bike-container">
    <CityBikeAvailability
      bikesAvailable={station.bikesAvailable}
      totalSpaces={station.bikesAvailable + station.spacesAvailable}
    />
    <CityBikeUse lang={lang} />
  </div>);

CityBikeContent.displayName = 'CityBikeContent';

CityBikeContent.description = (
  <div>
    <p>Renders content of a citybike card</p>
    <ComponentUsageExample description="">
      <CityBikeContent station={exampleStation} />
    </ComponentUsageExample>
  </div>);

CityBikeContent.propTypes = {
  station: React.PropTypes.object.isRequired,
  lang: React.PropTypes.string.isRequired,
};

export default CityBikeContent;
