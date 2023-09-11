import React from 'react';
import { v4 as uuid } from 'uuid';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import DepartureRow from './DepartureRow';

const StopNearYouDepartureRowContainer = ({
  stopTimes,
  mode,
  setCapacityModalOpen,
  vehicles,
  ...props
}) => {
  const sortedStopTimes = stopTimes
    .slice()
    .sort(
      (a, b) =>
        a.serviceDay +
        a.realtimeDeparture -
        (b.serviceDay + b.realtimeDeparture),
    );

  const mapCapacityToText = occu => {
    if (occu >= 0 && occu < 5) {
      return 'many-seats-available';
    }
    if (occu >= 5 && occu < 20) {
      return 'few-seats-available';
    }
    if (occu >= 20 && occu < 50) {
      return 'standing-room-only';
    }
    if (occu >= 50 && occu < 70) {
      return 'crushed-standing-room-only';
    }
    return 'full-capacity';
  };

  const departures = sortedStopTimes.map(row => {
    const departureTime = row.serviceDay + row.realtimeDeparture;
    // Find matching live vehicle with route and departure time
    const scheduledDeparture = row.trip.gtfsId.split('_')[4];
    const matchingRealtimeVehicle = Object.keys(vehicles)
      .map(key => vehicles[key])
      .filter(
        vehicle =>
          vehicle.shortName === row.trip.route.shortName &&
          vehicle.tripStartTime === scheduledDeparture,
      )[0];
    let capacityText;
    if (matchingRealtimeVehicle) {
      capacityText = mapCapacityToText(matchingRealtimeVehicle?.occu);
    }
    return (
      <DepartureRow
        key={uuid()}
        departure={row}
        departureTime={departureTime}
        currentTime={props.currentTime}
        showPlatformCode={props.isStation}
        showLink
        onCapacityClick={() => setCapacityModalOpen(true)}
        capacity={capacityText || 'few-seats-available'}
      />
    );
  });
  return (
    <table className="near-departures-container">
      <thead className="sr-only">
        <tr>
          <th>
            <FormattedMessage id="route" defaultMessage="Route" />
          </th>
          <th>
            <FormattedMessage id="destination" defaultMessage="Destination" />
          </th>
          <th>
            <FormattedMessage id="leaving-at" defaultMessage="Leaves" />
          </th>
          <th>
            <FormattedMessage
              id={mode === 'BUS' ? 'platform' : 'track'}
              defaultMessage={mode === 'BUS' ? 'Platform' : 'Track'}
            />
          </th>
        </tr>
      </thead>
      <tbody>{departures}</tbody>
    </table>
  );
};

StopNearYouDepartureRowContainer.propTypes = {
  stopTimes: PropTypes.arrayOf(
    PropTypes.shape({
      distance: PropTypes.number,
    }),
  ),
  mode: PropTypes.string.isRequired,
  isStation: PropTypes.bool.isRequired,
  currentTime: PropTypes.number.isRequired,
  setCapacityModalOpen: PropTypes.func.isRequired,
  vehicles: PropTypes.object,
};
export default StopNearYouDepartureRowContainer;
