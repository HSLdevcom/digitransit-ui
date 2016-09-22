import React from 'react';
import Relay from 'react-relay';

import DepartureRowContainer from './DepartureRowContainer';
import BicycleRentalStationRowContainer from './BicycleRentalStationRowContainer';
import config from '../../config';

const carParkRowContainerFragment = () => Relay.QL`
  fragment on CarPark {
    name
  }
`;

const CarParkRow = (props) => (<div>{props.station.name}</div>);

CarParkRow.propTypes = {
  station: React.PropTypes.object.isRequired,
  distance: React.PropTypes.number.isRequired,
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

const BikeParkRow = (props) => (<div>{props.station.name}</div>);

BikeParkRow.propTypes = {
  station: React.PropTypes.object.isRequired,
  distance: React.PropTypes.number.isRequired,
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
      ${BicycleRentalStationRowContainer.getFragment('station', {
        currentTime: variables.currentTime })}
      ${BikeParkRowContainer.getFragment('station', { currentTime: variables.currentTime })}
      ${CarParkRowContainer.getFragment('station', { currentTime: variables.currentTime })}
    }
  }
`;

/* eslint-disable no-underscore-dangle */
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
  return place;
};
/* eslint-enable no-underscore-dangle */

PlaceAtDistance.propTypes = {
  placeAtDistance: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
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
          __typename
          ... on DepartureRow {
            stoptimes (startTime:$currentTime, timeRange:$timeRange, numberOfDepartures:2) {
              realtimeState
            }
          }
        }
        ${PlaceAtDistanceContainer.getFragment('placeAtDistance', {
          currentTime: variables.currentTime })},
      }
    }
  }
`;

/* eslint-disable no-underscore-dangle */
const PlaceAtDistanceList = (props) => {
  let rows = [];
  if (props.places && props.places.edges) {
    props.places.edges.forEach((edge) => {
      const node = edge.node;
      const hasDepartures = node.place.__typename !== 'DepartureRow' ||
        (node.place.stoptimes && node.place.stoptimes.length > 0);
      if (hasDepartures) {
        rows.push(
          <PlaceAtDistanceContainer
            key={node.place.id}
            currentTime={props.currentTime}
            placeAtDistance={node}
          />
        );
      }
    });
  }
  return (<div>{rows}</div>);
};
/* eslint-enable no-underscore-dangle */

PlaceAtDistanceList.propTypes = {
  places: React.PropTypes.object.isRequired,
  currentTime: React.PropTypes.number.isRequired,
};

export default Relay.createContainer(PlaceAtDistanceList, {
  fragments: {
    places: placeAtDistanceListContainerFragment,
  },

  initialVariables: {
    currentTime: 0,
    timeRange: config.nearbyRoutes.timeRange || 7200,
  },
});
