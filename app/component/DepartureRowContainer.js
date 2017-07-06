import PropTypes from 'prop-types';
import React from 'react';
import { gql } from 'react-apollo';
import { Link } from 'react-router';
import filter from 'lodash/filter';

import RouteNumberContainer from './RouteNumberContainer';
import Distance from './Distance';
import RouteDestination from './RouteDestination';
import DepartureTime from './DepartureTime';
import ComponentUsageExample from './ComponentUsageExample';
import { isCallAgencyDeparture } from '../util/legUtils';

export const departureRowContainerFragment = gql`
  fragment departureRowContainerFragment on DepartureRow {
    pattern {
      id
      route {
        id
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
          id
          name
        }
      }
      code
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
        id
        code
        platformCode
      }
      trip {
        id
        gtfsId
      }
    }
  }
`;

const hasActiveDisruption = (t, alerts) =>
  filter(alerts, alert => alert.effectiveStartDate < t && t < alert.effectiveEndDate).length > 0;

export default function DepartureRow(props) {
  const departure = props.departure;
  let departureTimes;
  let headsign;
  if (departure.stoptimes) {
    departureTimes = departure.stoptimes.map((departureTime) => {
      headsign = departureTime.stopHeadsign;
      const canceled = departureTime.realtimeState === 'CANCELED';
      const key = `${departure.pattern.route.gtfsId}:${departure.pattern.headsign}:
        ${departureTime.realtimeDeparture}`;

      return (
        <DepartureTime
          key={key}
          departureTime={departureTime.serviceDay + departureTime.realtimeDeparture}
          realtime={departureTime.realtime}
          currentTime={props.currentTime}
          canceled={canceled}
        />
      );
    });
  }

  return (
    <div className="next-departure-row padding-vertical-normal border-bottom">
      <Link
        to={`/linjat/${departure.pattern.route.gtfsId}/pysakit/${departure.pattern.code}`}
        key={departure.pattern.code}
      >
        <Distance distance={props.distance} />
        <RouteNumberContainer
          route={departure.pattern.route}
          hasDisruption={hasActiveDisruption(props.currentTime, departure.pattern.route.alerts)}
          isCallAgency={isCallAgencyDeparture(departure.stoptimes[0])}
        />
        <RouteDestination
          mode={departure.pattern.route.mode}
          destination={headsign || departure.pattern.route.longName}
        />
        {departureTimes}
      </Link>
    </div>
  );
}

DepartureRow.displayName = 'DepartureRow';

DepartureRow.propTypes = {
  departure: PropTypes.object.isRequired,
  distance: PropTypes.number.isRequired,
  currentTime: PropTypes.number.isRequired,
  timeRange: PropTypes.number.isRequired,
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

DepartureRow.description = () =>
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
  </div>;
