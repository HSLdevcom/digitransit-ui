import React from 'react';

import CardHeader from '../card/CardHeader';
import { station as exampleStation } from '../documentation/ExampleData';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Card from '../card/card';

const CityBikeCard = ({ station, children, className }) => {
  if (!station || !children || children.length === 0) {
    return false;
  }

  return (
    <div>
      <Card className={className}>
        <CardHeader name={station.name} description={station.stationId} />
        {children}
      </Card>
    </div>);
};

CityBikeCard.description = (
  <div>
    <p>Renders a citybike card with header and child props as content</p>
    <ComponentUsageExample description="">
      <CityBikeCard className="padding-small" station={exampleStation}>
        Im content of the citybike card
      </CityBikeCard>
    </ComponentUsageExample>
  </div>);

CityBikeCard.displayName = 'CityBikeCard';

CityBikeCard.propTypes = {
  station: React.PropTypes.object.isRequired,
  className: React.PropTypes.string,
  children: React.PropTypes.array,
};

export default CityBikeCard;
