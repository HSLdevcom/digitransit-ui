import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { routerShape } from 'react-router';

import RouteNumberContainer from './RouteNumberContainer';
import Distance from './Distance';
import RouteDestination from './RouteDestination';
import DepartureTime from './DepartureTime';
import ComponentUsageExample from './ComponentUsageExample';
import { RouteAlertsQuery, StopAlertsQuery } from '../util/alertQueries';
import {
  getServiceAlertsForRoute,
  getServiceAlertsForStop,
  isAlertActive,
  stoptimeHasCancelation,
} from '../util/alertUtils';
import { isCallAgencyDeparture } from '../util/legUtils';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';

const DepartureRow = ({ departure, currentTime, distance }, context) => {
  let departureTimes;
  let stopAlerts = [];
  let headsign;
  if (departure.stoptimes) {
    departureTimes = departure.stoptimes.map(departureTime => {
      stopAlerts = getServiceAlertsForStop(departureTime.stop);
      headsign = departureTime.stopHeadsign;
      const canceled = departureTime.realtimeState === 'CANCELED';
      const key = `${departure.pattern.route.gtfsId}:${
        departure.pattern.headsign
      }:${departureTime.realtimeDeparture}`;
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

  // DT-3331: added query string sort=no
  const departureLinkUrl = `/${PREFIX_ROUTES}/${
    departure.pattern.route.gtfsId
  }/${PREFIX_STOPS}/${departure.pattern.code}?sort=no`;

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

  const hasActiveAlert = isAlertActive(
    departure.stoptimes.filter(stoptimeHasCancelation),
    [
      ...getServiceAlertsForRoute(
        departure.pattern.route,
        departure.pattern.code,
      ),
      ...stopAlerts,
    ],
    currentTime,
  );
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
          hasDisruption={hasActiveAlert}
          isCallAgency={isCallAgencyDeparture(departure.stoptimes[0])}
        />
      </td>
      <td className="td-destination">
        <RouteDestination
          mode={departure.pattern.route.mode}
          destination={
            headsign ||
            departure.pattern.headsign ||
            departure.pattern.route.longName
          }
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
      gtfsId: 'FOO:123',
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
      gtfsId: 'HSL:123',
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

export default Relay.createContainer(DepartureRow, {
  fragments: {
    departure: () => Relay.QL`
      fragment on DepartureRow {
        pattern {
          route {
            gtfsId
            shortName
            longName
            mode
            color
            alerts {
              id
            }
            ${RouteAlertsQuery}
            agency {
              name
            }
          }
          code
          headsign
        }
        stoptimes (startTime:$currentTime, timeRange:$timeRange, numberOfDepartures:2) {
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
            ${StopAlertsQuery}
          }
          trip {
            gtfsId
          }
        }
      }
    `,
  },

  initialVariables: {
    currentTime: 0,
    timeRange: 0,
  },
});
