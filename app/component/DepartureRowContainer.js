import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import filter from 'lodash/filter';

import RouteNumberContainer from './RouteNumberContainer';
import Distance from './Distance';
import RouteDestination from './RouteDestination';
import DepartureTime from './DepartureTime';
import ComponentUsageExample from './ComponentUsageExample';

const departureRowContainerFragment = () => Relay.QL`
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
          effectiveStartDate
          effectiveEndDate
        }
        agency {
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
`;

const hasActiveDisruption = (t, alerts) =>
  filter(alerts, alert => alert.effectiveStartDate < t && t < alert.effectiveEndDate).length > 0;

const DepartureRow = (props) => {
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
        />
        <RouteDestination
          mode={departure.pattern.route.mode}
          destination={headsign || departure.pattern.route.longName}
        />
        {departureTimes}
      </Link>
    </div>
  );
};

DepartureRow.displayName = 'DepartureRow';

DepartureRow.propTypes = {
  departure: React.PropTypes.object.isRequired,
  distance: React.PropTypes.number.isRequired,
  currentTime: React.PropTypes.number.isRequired,
  timeRange: React.PropTypes.number.isRequired,
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


export { DepartureRow };

export default Relay.createContainer(DepartureRow, {
  fragments: {
    departure: departureRowContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
    timeRange: 0,
  },
});
