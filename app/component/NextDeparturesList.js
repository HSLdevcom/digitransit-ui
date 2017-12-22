import PropTypes from 'prop-types';
import React from 'react';
import { routerShape } from 'react-router';
import sortBy from 'lodash/sortBy';
import Distance from './Distance';
import RouteNumber from './RouteNumber';
import RouteDestination from './RouteDestination';
import DepartureTime from './DepartureTime';
import { PREFIX_ROUTES } from '../util/path';

// TODO: Alerts aren't showing properly
// Need to implement logic as per DepartureListContainer
function NextDeparturesList(props, context) {
  const departures = props.departures.map(originalDeparture => {
    const { distance } = originalDeparture;

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

  const departureObjs = sortBy(departures, ['roundedDistance', 'sorttime']).map(
    departure => {
      const { stoptime } = departure;

      const departureTimes = stoptime.stoptimes.map(departureTime => {
        const canceled = departureTime.realtimeState === 'CANCELED';
        const key = `${stoptime.pattern.route.gtfsId}:${
          stoptime.pattern.headsign
        }:
        ${departureTime.realtimeDeparture}`;

        return (
          <td key={`${key}-td`} className="td-departure-times">
            <DepartureTime
              key={key}
              departureTime={
                departureTime.serviceDay + departureTime.realtimeDeparture
              }
              realtime={departureTime.realtime}
              currentTime={props.currentTime}
              canceled={canceled}
            />
          </td>
        );
      });

      const getDeparture = val => {
        context.router.push(val);
      };

      const departureLinkUrl = `/${PREFIX_ROUTES}/${
        stoptime.pattern.route.gtfsId
      }/pysakit/${stoptime.pattern.code}`;

      // In case there's only one departure for the route,
      // add a dummy cell to keep the table layout from breaking
      const departureTimesChecked =
        departureTimes.length < 2
          ? [
              departureTimes[0],
              <td
                key={`${departureTimes[0].key}-empty`}
                className="td-departure-times"
              />,
            ]
          : departureTimes;

      // TODO: Should this be its own view component?
      return (
        <tr
          className="next-departure-row-tr"
          onClick={() => getDeparture(departureLinkUrl)}
          style={{ cursor: 'pointer' }}
          key={stoptime.pattern.code}
        >
          <td className="td-distance">
            <Distance distance={departure.distance} />
          </td>
          <td className="td-route-number">
            <RouteNumber
              mode={stoptime.pattern.route.mode}
              text={stoptime.pattern.route.shortName}
              hasDisruption={departure.hasDisruption}
            />
          </td>
          <td className="td-destination">
            <RouteDestination
              mode={stoptime.pattern.route.mode}
              destination={
                stoptime.pattern.headsign || stoptime.pattern.route.longName
              }
            />
          </td>
          {departureTimesChecked}
        </tr>
      );
    },
  );

  return <div>{departureObjs}</div>;
}

NextDeparturesList.propTypes = {
  departures: PropTypes.array.isRequired,
  currentTime: PropTypes.number.isRequired, // eslint-disable-line react/no-unused-prop-types
};

NextDeparturesList.contextTypes = {
  // eslint-disable-next-line react/no-typos
  router: routerShape.isRequired,
};

export default NextDeparturesList;
