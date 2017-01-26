import React from 'react';
import Relay from 'react-relay';
import { intlShape } from 'react-intl';

import Distance from './Distance';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

const bicycleRentalRowContainerFragment = () => Relay.QL`
  fragment on BikeRentalStation {
    name
    stationId
    bikesAvailable
    spacesAvailable
  }
`;

const BicycleRentalStationRow = (props, context) => {
  let availabilityIcon = null;

  if (props.station.bikesAvailable === 0 && props.station.spacesAvailable === 0) {
    availabilityIcon = (<Icon img="icon-icon_not-in-use" />);
  } else if (props.station.bikesAvailable > context.config.cityBike.fewAvailableCount) {
    availabilityIcon = (<Icon img="icon-icon_good-availability" />);
  } else if (props.station.bikesAvailable > 0) {
    availabilityIcon = (<Icon img="icon-icon_poor-availability" />);
  } else {
    availabilityIcon = (<Icon img="icon-icon_no-availability" />);
  }

  // TODO implement disruption checking

  return (
    <div className="next-departure-row padding-vertical-normal border-bottom">
      <Distance distance={props.distance} />
      <div className="bicycle-rental-station">
        <RouteNumber
          mode="citybike"
          text={props.station.stationId}
          hasDisruption={false}
        />
        <span className="city-bike-station-name overflow-fade">{props.station.name}</span>
        <span className="city-bike-station-availability">
          <span className="bikes-label">
            {context.intl.formatMessage({ id: 'bike-availability-short', defaultMessage: 'Bikes' })}
          </span>
          <span className="bikes-available">{props.station.bikesAvailable}</span>
          /
          {props.station.bikesAvailable + props.station.spacesAvailable}
          {availabilityIcon}
        </span>
      </div>
    </div>
  );
};

BicycleRentalStationRow.propTypes = {
  station: React.PropTypes.object.isRequired,
  distance: React.PropTypes.number.isRequired,
};

BicycleRentalStationRow.contextTypes = {
  intl: intlShape.isRequired,
  config: React.PropTypes.object.isRequired,
};

BicycleRentalStationRow.displayName = 'BicycleRentalStationRow';

const exampleStation1 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 12,
  spacesAvailable: 16,
};

const exampleStation2 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 2,
  spacesAvailable: 16,
};

const exampleStation3 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 0,
  spacesAvailable: 16,
};

BicycleRentalStationRow.description = () =>
  <div>
    <ComponentUsageExample description="plenty of bikes available">
      <BicycleRentalStationRow
        station={exampleStation1}
        distance={256}
        currentTime={1473676196}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="few bikes available">
      <BicycleRentalStationRow
        station={exampleStation2}
        distance={256}
        currentTime={1473676196}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="no bikes available">
      <BicycleRentalStationRow
        station={exampleStation3}
        distance={256}
        currentTime={1473676196}
      />
    </ComponentUsageExample>
  </div>;

export { BicycleRentalStationRow };

export default Relay.createContainer(BicycleRentalStationRow, {
  fragments: {
    station: bicycleRentalRowContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
  },
});
