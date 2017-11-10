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

  if (
    props.station.bikesAvailable === 0 &&
    props.station.spacesAvailable === 0
  ) {
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

  return (
    <tr className="next-departure-row-tr">
      <td className="td-distance">
        <Distance distance={props.distance} />
      </td>
      <td className="td-route-number overflow-fade">
        <RouteNumber
          mode="citybike"
          text={props.station.stationId}
          hasDisruption={false}
        />
      </td>
      <td className="td-bikestation">
        <span className="city-bike-station-name overflow-fade">
          {props.station.name}
        </span>
      </td>
      <td className="td-bikes-available-left">
        <span className="city-bike-station-availability">
          <span className="bikes-label">
            {context.intl.formatMessage({
              id: 'bike-availability-short',
              defaultMessage: 'Bikes',
            })}
          </span>
        </span>
      </td>
      <td className="td-bikes-available-right">
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
      }
    `,
  },

  initialVariables: {
    currentTime: 0,
  },
});
