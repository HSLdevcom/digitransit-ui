import React from 'react';
import Relay from 'react-relay';
//import mapProps from 'recompose/mapProps';
import config from '../../config';

// const NearbyRouteListContainer = mapProps(props => ({
//   departures: getNextDepartures(props),
//   currentTime: parseInt(props.currentTime, 10),
// }))(NextDeparturesList);

// const NearbyPlaceAtDistanceListContainer = {};

// const DepartureRowContainer = Relay.createContainer(DepartureRow, {
//   fragment on DepartureRow {
//     pattern {
//       code
//       headsign
//       route {
//         id
//         gtfsId
//         mode
//         shortName
//       }
//     }
//     stoptimes (startTime:$currentTime, numberOfDepartures:2) {
//       serviceDay
//       realtimeArrival
//       realtime
//       pickupType
//     }
//   }
// });

// const BicycleRentalStationRowContainer = Relay.createContainer(BicycleRentalStationRow, {
//   fragment on BikeRentalStation {
//     stationId
//     name
//     bikesAvailable
//     spacesAvailable
//   }
// });

// const BikeParkRowContainer = Relay.createContainer(BikeParkRow, {
//   fragment on BikePark {
//     bikeParkId
//     name
//     spacesAvailable
//   }
// });

// const CarParkRowContainer = Relay.createContainer(CarParkRow, {
//   fragment on CarPark {
//     carParkId
//     name
//     spacesAvailable
//     maxCapacity
//   }
// });

const PlaceAtDistanceRow = (props) => {
  console.log(props);
  return (
      <span>Hello</span>
  );
};

//          ${DepartureRow.getFragment('DepartureRow', { currentTime: variables.currentTime, })}
//          ${BicycleRentalRow.getFragment('BicycleRentalRow', { currentTime: variables.currentTime, })}
//          ${BikeParkRow.getFragment('BikeParkRow', { currentTime: variables.currentTime, })}
//          ${CarParkRow.getFragment('CarParkRow', { currentTime: variables.currentTime, })}

export const placeAtDistanceFragment = () => Relay.QL`
  fragment on placeAtDistance {
    distance
    place {
      id
      __typename
    }
  }
`;


export default Relay.createContainer(PlaceAtDistanceRow, {
  fragments: {
    placeAtDistance: placeAtDistanceFragment,
  },

  initialVariables: {
    currentTime: '0',
  },
});
