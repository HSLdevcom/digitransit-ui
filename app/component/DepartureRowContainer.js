import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import { routerShape } from 'react-router';
import filter from 'lodash/filter';

import RouteNumberContainer from './RouteNumberContainer';
import Distance from './Distance';
import RouteDestination from './RouteDestination';
import DepartureTime from './DepartureTime';
import ComponentUsageExample from './ComponentUsageExample';
import { isCallAgencyDeparture } from '../util/legUtils';
import { PREFIX_ROUTES } from '../util/path';

const hasActiveDisruption = (t, alerts) =>
  filter(
    alerts,
    alert => alert.effectiveStartDate < t && t < alert.effectiveEndDate,
  ).length > 0;

const DepartureRow = ({ departure, currentTime, distance }, context) => {
  let departureTimes;
  let headsign;
  if (departure.stoptimes) {
    departureTimes = departure.stoptimes.map(departureTime => {
      headsign = departureTime.stopHeadsign;
      const canceled = departureTime.realtimeState === 'CANCELED';
      const key = `${departure.pattern.route.gtfsId}:${
        departure.pattern.headsign
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
            currentTime={currentTime}
            canceled={canceled}
          />
        </td>
      );
    });
  }

  const getDeparture = val => {
    context.router.push(val);
  };

  const departureLinkUrl = `/${PREFIX_ROUTES}/${
    departure.pattern.route.gtfsId
  }/pysakit/${departure.pattern.code}`;

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

  return (
    <tr
      className="next-departure-row-tr"
      onClick={() => getDeparture(departureLinkUrl)}
      style={{ cursor: 'pointer' }}
    >
      <td className="td-distance">
        <Distance distance={distance} />
      </td>
      <td className="td-route-number">
        <RouteNumberContainer
          route={departure.pattern.route}
          hasDisruption={hasActiveDisruption(
            currentTime,
            departure.pattern.route.alerts,
          )}
          isCallAgency={isCallAgencyDeparture(departure.stoptimes[0])}
        />
      </td>
      <td className="td-destination">
        <RouteDestination
          mode={departure.pattern.route.mode}
          destination={headsign || departure.pattern.route.longName}
        />
      </td>
      {departureTimesChecked}
    </tr>
  );
};

DepartureRow.displayName = 'DepartureRow';

DepartureRow.propTypes = {
  departure: PropTypes.object.isRequired,
  distance: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
};

DepartureRow.contextTypes = {
  router: routerShape,
};

const exampleDeparture1 = {
  pattern: {
    code: '28',
    headSign: 'Tampere',
    route: {
      gtfsId: '123',
      mode: 'RAIL',
      shortName: 'IC28',
    },
  },
  stoptimes: [
    {
      realtimeDeparture: 6900,
      realtime: true,
      serviceDay: 1473670000,
    },
    {
      realtimeDeparture: 8000,
      realtime: false,
      serviceDay: 1473670000,
    },
  ],
};

const exampleDeparture2 = {
  pattern: {
    code: '154',
    headSign: 'Kamppi',
    route: {
      gtfsId: '123',
      mode: 'BUS',
      shortName: '154',
    },
  },
  stoptimes: [
    {
      realtimeDeparture: 7396,
      realtime: true,
      serviceDay: 1473670000,
      realtimeState: 'CANCELED',
    },
    {
      realtimeDeparture: 9000,
      realtime: false,
      serviceDay: 1473670000,
    },
  ],
};

DepartureRow.description = () => (
  <div>
    <ComponentUsageExample description="example">
      <DepartureRow
        departure={exampleDeparture1}
        distance={123}
        currentTime={1473676196}
      />
    </ComponentUsageExample>
    <ComponentUsageExample description="with cancellation">
      <DepartureRow
        departure={exampleDeparture2}
        distance={123}
        currentTime={1473676196}
      />
    </ComponentUsageExample>
  </div>
);

export { DepartureRow };

export default createFragmentContainer(DepartureRow, {
  departure: graphql`
    fragment DepartureRowContainer_departure on DepartureRow {
      pattern {
        route {
          gtfsId
          shortName
          longName
          mode
          color
          alerts {
            id
            effectiveStartDate
            effectiveEndDate
          }
          agency {
            name
          }
        }
        code
      }
      stoptimes(
        startTime: $currentTime
        timeRange: $timeRange
        numberOfDepartures: 2
      ) {
        realtimeState
        realtimeDeparture
        scheduledDeparture
        realtimeArrival
        scheduledArrival
        pickupType
        realtime
        serviceDay
        stopHeadsign
        stop {
          code
          platformCode
        }
        trip {
          gtfsId
        }
      }
    }
  `,
});
