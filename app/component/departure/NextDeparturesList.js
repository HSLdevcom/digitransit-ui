import React, { PropTypes } from 'react';
import Relay from 'react-relay';
import Distance from './distance';
import RouteNumber from './route-number';
import RouteDestination from './route-destination';
import DepartureTime from './DepartureTime';
import Link from 'react-router/lib/Link';
import sortBy from 'lodash/sortBy';


// TODO: Alerts aren't showing properly
// Need to implement logic as per DepartureListContainer
function NextDeparturesList(props) {
  const departureObjs = [];

  const departures = props.departures.map(originalDeparture => {
    const distance = originalDeparture.distance;

    // TODO: use util or util Component
    const roundedDistance = distance < 1000 ?
        (distance - distance % 10) / 1000 :
        (distance - distance % 100) / 1000;

    const departure = Object.assign({}, originalDeparture, { roundedDistance });

    if (departure.stoptime == null || departure.stoptime.stoptimes.length === 0) {
      return departure;
    }

    const firstTime = departure.stoptime.stoptimes[0];

    departure.sorttime = firstTime.serviceDay +
      (firstTime.realtime ? firstTime.realtimeDeparture : firstTime.scheduledDeparture);

    return departure;
  });

  const sortedDepartures = sortBy(departures, ['roundedDistance', 'sorttime']);

  for (const departure of sortedDepartures) {
    const stoptime = departure.stoptime;
    const departureTimes = [];

    for (const departureTime of stoptime.stoptimes) {
      const canceled = departureTime.realtimeState === 'CANCELED';
      const key = `${stoptime.pattern.route.gtfsId}:${stoptime.pattern.headsign}:
        ${departureTime.realtimeDeparture}`;

      departureTimes.push(
        <DepartureTime
          key={key}
          departureTime={departureTime.serviceDay + departureTime.realtimeDeparture}
          realtime={departureTime.realtime}
          currentTime={props.currentTime}
          canceled={canceled}
        />
      );
    }

    // TODO: Should this be its own view component?
    departureObjs.push(
      <Link to={`/linjat/${stoptime.pattern.code}`} key={stoptime.pattern.code}>
        <div className="next-departure-row padding-vertical-normal border-bottom">
          <Distance distance={departure.distance} />
          <RouteNumber
            mode={stoptime.pattern.route.type}
            text={stoptime.pattern.route.shortName}
          />
          <RouteDestination
            mode={stoptime.pattern.route.type}
            destination={stoptime.pattern.headsign || stoptime.pattern.route.longName}
          />
          {departureTimes}
        </div>
      </Link>
    );
  }

  return <div>{departureObjs}</div>;
}

NextDeparturesList.propTypes = {
  departures: PropTypes.array.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default NextDeparturesList;

export const relayFragment = Relay.QL`
  fragment on StoptimesInPattern{
    pattern {
      code
      headsign
      route {
        gtfsId
        shortName
        longName
        type
      }
    }
    stoptimes {
      realtimeState
      realtimeDeparture
      scheduledDeparture
      realtime
      serviceDay
    }
  }`;
