import React from 'react';
import Relay from 'react-relay';
import Link from 'react-router/lib/Link';

import Distance from '../departure/Distance';
import RouteNumber from '../departure/RouteNumber';
import RouteDestination from '../departure/RouteDestination';
import DepartureTime from '../departure/DepartureTime';
import config from '../../config';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

const departureRowContainerFragment = () => Relay.QL`
  fragment on DepartureRow {
    pattern {
      alerts {
        effectiveStartDate
        effectiveEndDate
        trip {
          gtfsId
        }
      }
      route {
        gtfsId
        shortName
        longName
        mode
        color
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
      realtime
      serviceDay
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

const DepartureRow = (props) => {
  const departure = props.departure;
  let departureTimes;
  if (departure.stoptimes) {
    departureTimes = departure.stoptimes.map((departureTime) => {
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

  // TODO implement disruption checking

  return (
    <div className="next-departure-row padding-vertical-normal border-bottom">
      <Link to={`/linjat/${departure.pattern.code}`} key={departure.pattern.code}>
        <Distance distance={props.distance} />
        <RouteNumber
          mode={departure.pattern.route.mode}
          text={departure.pattern.route.shortName}
          hasDisruption={departure.hasDisruption}
        />
        <RouteDestination
          mode={departure.pattern.route.mode}
          destination={departure.pattern.headsign || departure.pattern.route.longName}
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

DepartureRow.description = (
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
    departure: departureRowContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
    timeRange: config.nearbyRoutes.timeRange || 7200,
  },
});
