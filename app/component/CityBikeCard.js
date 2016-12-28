import React from 'react';

import CardHeader from './CardHeader';
import { station as exampleStation } from './ExampleData';
import ComponentUsageExample from './ComponentUsageExample';
import Card from './Card';
import Favourite from './Favourite';

const CityBikeCard = ({ station, children, className, isFavourite, toggleFavourite }) => {
  if (!station || !children || children.length === 0) {
    return false;
  }

  return (
    <Card className={className}>
      <CardHeader
        name={station.name}
        description={station.stationId}
        icon="icon-icon_citybike"
        unlinked
        icons={[<Favourite
          favourite={isFavourite}
          addFavourite={toggleFavourite}
        />,
        ]}
      />
      {children}
    </Card>
  );
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
      <CityBikeCard
        className="padding-small"
        toggleFavourite={() => {}} isFavourite station={exampleStation}
      >
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
