import React from 'react';
import Relay from 'react-relay';
import cx from 'classnames';
import Link from 'react-router/lib/Link';
import Distance from '../departure/distance';
import RouteNumber from '../departure/RouteNumber';
import RouteDestination from '../departure/RouteDestination';
import DepartureTime from '../departure/DepartureTime';
//import mapProps from 'recompose/mapProps';
import config from '../../config';

// const NearbyRouteListContainer = mapProps(props => ({
//   departures: getNextDepartures(props),
//   currentTime: parseInt(props.currentTime, 10),
// }))(NextDeparturesList);

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
    stoptimes (startTime:$currentTime, timeRange:7200, numberOfDepartures:2) {
      realtimeState
      realtimeDeparture
      scheduledDeparture
      realtimeArrival
      scheduledArrival
      realtime
      serviceDay
      pickupType
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

  return (
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
  );
};

const DepartureRowContainer = Relay.createContainer(DepartureRow, {
  fragments: {
    departure: departureRowContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
  },
});

const placeAtDistanceFragment = variables => Relay.QL`
  fragment on placeAtDistance {
    distance
    place {
      id
      __typename
      ${DepartureRowContainer.getFragment('departure', { currentTime: variables.currentTime })}
    }
  }
`;
      // ${BicycleRentalRowContainer.getFragment('bicycleRentalRow', { currentTime: variables.currentTime })}
      // ${BikeParkRowContainer.getFragment('bikeParkRow', { currentTime: variables.currentTime })}
      // ${CarParkRowContainer.getFragment('carParkRow', { currentTime: variables.currentTime })}

const PlaceAtDistance = (props) => {
  let place;

  if (props.placeAtDistance.place.__typename === 'DepartureRow') {
    place = (
      <DepartureRowContainer
        distance={props.placeAtDistance.distance}
        departure={props.placeAtDistance.place}
        currentTime={props.currentTime}
      />
    );
  }
  return (
    <div className="next-departure-row padding-vertical-normal border-bottom">
      {place}
    </div>
  );
};

const PlaceAtDistanceContainer = Relay.createContainer(PlaceAtDistance, {
  fragments: {
    placeAtDistance: placeAtDistanceFragment,
  },

  initialVariables: {
    currentTime: 0,
  },
});

export const placeAtDistanceListContainerFragment = variables => Relay.QL`
  fragment on placeAtDistanceConnection {
    edges {
      node {
        place {
          id
        }
        ${PlaceAtDistanceContainer.getFragment('placeAtDistance', { currentTime: variables.currentTime })},
      }
    }
  }
`;

const PlaceAtDistanceList = (props) => {
  let rows = [];
  for (const i in props.places.edges) {
    const node = props.places.edges[i].node;
    rows.push(
        <PlaceAtDistanceContainer key={node.place.id} currentTime={props.currentTime} placeAtDistance={node} />
    );
  }
  return (<div>{rows}</div>);
};

export default Relay.createContainer(PlaceAtDistanceList, {
  fragments: {
    places: placeAtDistanceListContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
  },
});
