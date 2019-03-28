import PropTypes from 'prop-types';
import React from 'react';

import CardHeader from './CardHeader';
import { station as exampleStation } from './ExampleData';
import ComponentUsageExample from './ComponentUsageExample';
import Card from './Card';
import { getCityBikeNetworkIcon } from '../util/citybikes';

const CityBikeCard = ({ station, children, className }, { config }) => {
  if (!station || !children || children.length === 0) {
    return false;
  }

  const iconName = station.networks
    ? getCityBikeNetworkIcon(station.networks[0])
    : 'icon-icon_citybike';

  return (
    <Card className={className}>
      <CardHeader
        name={station.name}
        description={config.cityBike.showStationId ? station.stationId : ''}
        icon={`${iconName}`}
        network={station.networks ? station.networks[0] : 'citybike'}
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
      <CityBikeCard className="padding-small" station={exampleStation}>
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
};

CityBikeCard.contextTypes = {
  config: PropTypes.object.isRequired,
};

export default CityBikeCard;
