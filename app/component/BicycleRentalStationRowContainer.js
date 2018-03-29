import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { intlShape } from 'react-intl';

import Distance from './Distance';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

const BicycleRentalStationRow = (props, context) => {
  let availabilityIcon = null;

  if (props.station.state !== 'Station on') {
    availabilityIcon = <Icon img="icon-icon_not-in-use" />;
  } else if (
    props.station.bikesAvailable > context.config.cityBike.fewAvailableCount
  ) {
    availabilityIcon = <Icon img="icon-icon_good-availability" />;
  } else if (props.station.bikesAvailable > 0) {
    availabilityIcon = <Icon img="icon-icon_poor-availability" />;
  } else {
    availabilityIcon = <Icon img="icon-icon_no-availability" />;
  }

  // TODO implement disruption checking
  // VM: is that needed? new state attribute tells if station is off
  const mode = props.station.state === 'Station on' ? 'citybike' : 'citybike_off';
  return (
    <tr className="next-departure-row-tr">
      <td className="td-distance">
        <Distance distance={props.distance} />
      </td>
      <td className="td-route-number">
        <RouteNumber
          mode={mode}
          text={props.station.stationId}
          hasDisruption={false}
        />
      </td>
      <td className="td-bikestation" colSpan="1">
        <span className="city-bike-station-name overflow-fade">
          {props.station.name}
        </span>
      </td>
      <td className="td-available-bikes" colSpan="2">
        <span className="city-bike-station-availability">
          <span className="bikes-label">
            {context.intl.formatMessage({
              id: 'bike-availability-short',
              defaultMessage: 'Bikes',
            })}
          </span>
        </span>
        <span className="bikes-available">{props.station.bikesAvailable}</span>
        /
        <span className="bikes-total">
          {props.station.bikesAvailable + props.station.spacesAvailable}
        </span>
        {availabilityIcon}
      </td>
    </tr>
  );
};

BicycleRentalStationRow.propTypes = {
  station: PropTypes.object.isRequired,
  distance: PropTypes.number.isRequired,
};

BicycleRentalStationRow.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object.isRequired,
};

BicycleRentalStationRow.displayName = 'BicycleRentalStationRow';

const exampleStation1 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 12,
  spacesAvailable: 16,
  state: 'Station on',
};

const exampleStation2 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 2,
  spacesAvailable: 16,
  state: 'Station on',
};

const exampleStation3 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 0,
  spacesAvailable: 16,
  state: 'Station on',
};

const exampleStation4 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 5,
  spacesAvailable: 16,
  state: 'Station off',
};

const exampleStation5 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 5,
  spacesAvailable: 16,
  state: 'Station closed',
};

BicycleRentalStationRow.description = () => (
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
    <ComponentUsageExample description="station off">
      <BicycleRentalStationRow
        station={exampleStation4}
        distance={256}
        currentTime={1473676196}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="station closed">
      <BicycleRentalStationRow
        station={exampleStation5}
        distance={256}
        currentTime={1473676196}
      />
    </ComponentUsageExample>
  </div>
);

export { BicycleRentalStationRow };

export default Relay.createContainer(BicycleRentalStationRow, {
  fragments: {
    station: () => Relay.QL`
      fragment on BikeRentalStation {
        name
        stationId
        bikesAvailable
        spacesAvailable
        state
      }
    `,
  },

  initialVariables: {
    currentTime: 0,
  },
});
