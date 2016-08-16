import React from 'react';

import CardHeader from '../card/CardHeader';
import { station as exampleStation } from '../documentation/ExampleData';
import ComponentUsageExample from '../documentation/ComponentUsageExample';
import Card from '../card/card';

const CityBikeCard = ({ station, children, className, isFavourite, toggleFavourite }) => {
  if (!station || !children || children.length === 0) {
    return false;
  }

  return (
    <div>
      <Card className={className}>
        <CardHeader
          addFavourite={toggleFavourite}
          name={station.name}
          description={station.stationId}
          favourite={isFavourite}
        />
        {children}
      </Card>
    </div>);
};

CityBikeCard.description = (
  <div>
    <p>Renders a citybike card with header and child props as content</p>
    <ComponentUsageExample description="Basic">
      <CityBikeCard className="padding-small" station={exampleStation}>
        Im content of the citybike card
      </CityBikeCard>
    </ComponentUsageExample>
    <ComponentUsageExample description="Selected as favourite">
      <CityBikeCard addFavourite={() => {}} isFavourite station={exampleStation}>
        Im content of the favourite citybike card
      </CityBikeCard>
    </ComponentUsageExample>
  </div>);

CityBikeCard.displayName = 'CityBikeCard';

CityBikeCard.propTypes = {
  station: React.PropTypes.object.isRequired,
  className: React.PropTypes.string,
  children: React.PropTypes.node.isRequired,
  toggleFavourite: React.PropTypes.func,
  isFavourite: React.PropTypes.bool,
};

export default CityBikeCard;
