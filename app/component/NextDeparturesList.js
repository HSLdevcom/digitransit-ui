import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import sortBy from 'lodash/sortBy';
import Distance from './Distance';
import RouteNumber from './RouteNumber';
import RouteDestination from './RouteDestination';
import DepartureTime from './DepartureTime';

// TODO: Alerts aren't showing properly
// Need to implement logic as per DepartureListContainer
function NextDeparturesList(props) {
  const departures = props.departures.map(originalDeparture => {
    const distance = originalDeparture.distance;

    // TODO: use util or util Component
    const roundedDistance =
      distance < 1000
        ? (distance - distance % 10) / 1000
        : (distance - distance % 100) / 1000;

    const departure = Object.assign({}, originalDeparture, { roundedDistance });

    if (
      departure.stoptime == null ||
      departure.stoptime.stoptimes.length === 0
    ) {
      return departure;
    }

    const firstTime = departure.stoptime.stoptimes[0];

    departure.sorttime =
      firstTime.serviceDay +
      (firstTime.realtime
        ? firstTime.realtimeDeparture
        : firstTime.scheduledDeparture);

    return departure;
  });

  const departureObjs = sortBy(departures, [
    'roundedDistance',
    'sorttime',
  ]).map(departure => {
    const stoptime = departure.stoptime;

    const departureTimes = stoptime.stoptimes.map(departureTime => {
      const canceled = departureTime.realtimeState === 'CANCELED';
      const key = `${stoptime.pattern.route.gtfsId}:${stoptime.pattern
        .headsign}:
        ${departureTime.realtimeDeparture}`;

      return (
        <DepartureTime
          key={key}
          departureTime={
            departureTime.serviceDay + departureTime.realtimeDeparture
          }
          realtime={departureTime.realtime}
          currentTime={props.currentTime}
          canceled={canceled}
        />
      );
    });

    // TODO: Should this be its own view component?
    return (
      <Link
        to={`/linjat/${stoptime.pattern.route.gtfsId}/pysakit/${stoptime.pattern
          .code}`}
        key={stoptime.pattern.code}
      >
        <div className="next-departure-row padding-vertical-normal border-bottom">
          <Distance distance={departure.distance} />
          <RouteNumber
            mode={stoptime.pattern.route.mode}
            text={stoptime.pattern.route.shortName}
            hasDisruption={departure.hasDisruption}
          />
          <RouteDestination
            mode={stoptime.pattern.route.mode}
            destination={
              stoptime.pattern.headsign || stoptime.pattern.route.longName
            }
          />
          {departureTimes}
        </div>
      </Link>
    );
  });

  return (
    <div>
      {departureObjs}
    </div>
  );
}

NextDeparturesList.propTypes = {
  departures: PropTypes.array.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default NextDeparturesList;
