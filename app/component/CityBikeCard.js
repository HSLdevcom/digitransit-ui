import PropTypes from 'prop-types';
import React from 'react';

import Card from './Card';
import CardHeader from './CardHeader';
import { station as exampleStation } from './ExampleData';
import ComponentUsageExample from './ComponentUsageExample';
import {
  getCityBikeNetworkConfig,
  getCityBikeNetworkIcon,
  getCityBikeNetworkId,
  getCityBikeNetworkName,
} from '../util/citybikes';

const CityBikeCard = (
  { station, children, className, language },
  { config },
) => {
  if (!station || !children || children.length === 0) {
    return false;
  }

  const networkConfig = getCityBikeNetworkConfig(
    getCityBikeNetworkId(station.networks),
    config,
  );

  const description = [
    getCityBikeNetworkName(networkConfig, language),
    config.cityBike.showStationId ? station.stationId : '',
  ]
    .join(' ')
    .trim();

  return (
    <Card className={className}>
      <CardHeader
        description={description}
        icon={getCityBikeNetworkIcon(networkConfig)}
        name={station.name}
        unlinked
      />
      {children}
    </Card>
  );
};

CityBikeCard.description = () => (
  <div>
    <p>Renders a citybike card with header and child props as content</p>
    <ComponentUsageExample description="Basic">
      <CityBikeCard className="card-padding" station={exampleStation}>
        Im content of the citybike card
      </CityBikeCard>
    </ComponentUsageExample>
  </div>
);

CityBikeCard.displayName = 'CityBikeCard';

CityBikeCard.propTypes = {
  station: PropTypes.object.isRequired,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
  language: PropTypes.string,
};

CityBikeCard.contextTypes = {
  config: PropTypes.object.isRequired,
};

CityBikeCard.defaultProps = {
  language: 'en',
};

export default CityBikeCard;
