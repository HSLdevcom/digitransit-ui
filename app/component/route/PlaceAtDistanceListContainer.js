import React from 'react';
import Relay from 'react-relay';
import cx from 'classnames';
import Link from 'react-router/lib/Link';
import Distance from '../departure/distance';
import RouteNumber from '../departure/RouteNumber';
import RouteDestination from '../departure/RouteDestination';
import DepartureTime from '../departure/DepartureTime';
import config from '../../config';

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
    timeRange: config.nearbyRoutes.timeRange || 7200,
  },
});

const bicycleRentalRowContainerFragment = () => Relay.QL`
  fragment on BikeRentalStation {
    name
  }
`;

const BicycleRentalStationRow = (props) => {
  return (<div>{props.station.name}</div>);
};

const BicycleRentalStationRowContainer = Relay.createContainer(BicycleRentalStationRow, {
  fragments: {
    station: bicycleRentalRowContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
  },
});


const carParkRowContainerFragment = () => Relay.QL`
  fragment on CarPark {
    name
  }
`;

const CarParkRow = (props) => {
  return (<div>{props.station.name}</div>);
};

const CarParkRowContainer = Relay.createContainer(CarParkRow, {
  fragments: {
    station: carParkRowContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
  },
});


const bikeParkRowContainerFragment = () => Relay.QL`
  fragment on BikePark {
    name
  }
`;

const BikeParkRow = (props) => {
  return (<div>{props.station.name}</div>);
};

const BikeParkRowContainer = Relay.createContainer(BikeParkRow, {
  fragments: {
    station: bikeParkRowContainerFragment,
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
      ${BicycleRentalStationRowContainer.getFragment('station', { currentTime: variables.currentTime })}
      ${BikeParkRowContainer.getFragment('station', { currentTime: variables.currentTime })}
      ${CarParkRowContainer.getFragment('station', { currentTime: variables.currentTime })}
    }
  }
`;

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
  } else if (props.placeAtDistance.place.__typename === 'BikeRentalStation') {
    place = (
      <BicycleRentalStationRowContainer
        distance={props.placeAtDistance.distance}
        station={props.placeAtDistance.place}
        currentTime={props.currentTime}
      />
    );
  } else if (props.placeAtDistance.place.__typename === 'BikePark') {
    place = (
      <BikeParkRowContainer
        distance={props.placeAtDistance.distance}
        station={props.placeAtDistance.place}
        currentTime={props.currentTime}
      />
    );
  } else if (props.placeAtDistance.place.__typename === 'CarPark') {
    place = (
      <CarParkRowContainer
        distance={props.placeAtDistance.distance}
        station={props.placeAtDistance.place}
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
  if (props.places) {
    for (const i in props.places.edges) {
      const node = props.places.edges[i].node;
      rows.push(
        <PlaceAtDistanceContainer key={node.place.id} currentTime={props.currentTime} placeAtDistance={node} />
      );
    }
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
