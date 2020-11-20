import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { intlShape } from 'react-intl';

import Distance from './Distance';
import RouteNumber from './RouteNumber';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import {
  BIKESTATION_ON,
  BIKESTATION_OFF,
  BIKESTATION_CLOSED,
  getCityBikeNetworkConfig,
  getCityBikeNetworkId,
  getCityBikeNetworkIcon,
  CityBikeNetworkType,
  BIKEAVL_UNKNOWN,
  BIKEAVL_WITHMAX,
} from '../util/citybikes';

const BicycleRentalStationRow = ({ distance, station }, { config, intl }) => {
  const { capacity } = config.cityBike;
  let availabilityIcon = null;

  if (capacity !== BIKEAVL_UNKNOWN) {
    if (station.state !== BIKESTATION_ON) {
      availabilityIcon = <Icon img="icon-icon_not-in-use" />;
    } else if (station.bikesAvailable > config.cityBike.fewAvailableCount) {
      availabilityIcon = <Icon img="icon-icon_good-availability" />;
    } else if (station.bikesAvailable > 0) {
      availabilityIcon = <Icon img="icon-icon_poor-availability" />;
    } else {
      availabilityIcon = <Icon img="icon-icon_no-availability" />;
    }
  } else if (station.state !== BIKESTATION_ON) {
    availabilityIcon = <Icon img="icon-icon_not-in-use" />;
  } else {
    availabilityIcon = <Icon img="icon-icon_good-availability" />;
  }

  const networkConfig = getCityBikeNetworkConfig(
    getCityBikeNetworkId(station.networks),
    config,
  );
  const networkIcon = getCityBikeNetworkIcon(networkConfig);
  const isOff = station.state !== BIKESTATION_ON;

  return (
    <tr className="next-departure-row-tr">
      <td className="td-distance">
        <Distance distance={distance} />
      </td>
      <td className="td-route-number">
        <RouteNumber
          icon={isOff ? `${networkIcon}_off` : networkIcon}
          mode={isOff ? 'citybike_off' : 'citybike'}
          text={station.stationId !== station.name ? station.stationId : ''}
        />
      </td>
      <td className="td-bikestation" colSpan="1">
        <span className="city-bike-station-name overflow-fade">
          {station.name}
        </span>
      </td>
      <td className="td-available-bikes" colSpan="2">
        {capacity !== BIKEAVL_UNKNOWN && (
          <span className="city-bike-station-availability">
            <span className="bikes-label">
              {intl.formatMessage({
                id: `${
                  networkConfig.type === CityBikeNetworkType.CityBike
                    ? 'bike'
                    : 'scooter'
                }-availability-short`,
                defaultMessage: 'Bikes',
              })}
            </span>
          </span>
        )}
        {capacity !== BIKEAVL_UNKNOWN && (
          <span className="city-bike-station-availability">
            <span className="bikes-available">{station.bikesAvailable}</span>
            {capacity === BIKEAVL_WITHMAX && (
              <React.Fragment>
                /
                <span className="bikes-total">
                  {station.bikesAvailable + station.spacesAvailable}
                </span>
              </React.Fragment>
            )}
          </span>
        )}
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
  state: BIKESTATION_ON,
};

const exampleStation2 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 2,
  spacesAvailable: 16,
  state: BIKESTATION_ON,
};

const exampleStation3 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 0,
  spacesAvailable: 16,
  state: BIKESTATION_ON,
};

const exampleStation4 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 5,
  spacesAvailable: 16,
  state: BIKESTATION_OFF,
};

const exampleStation5 = {
  stationId: 'A27',
  name: 'Mannerheimintie',
  bikesAvailable: 5,
  spacesAvailable: 16,
  state: BIKESTATION_CLOSED,
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
        networks
      }
    `,
  },

  initialVariables: {
    currentTime: 0,
  },
});
