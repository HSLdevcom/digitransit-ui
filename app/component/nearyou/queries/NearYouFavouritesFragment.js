import { graphql } from 'react-relay';

export default {
  stops: graphql`
    fragment NearYouFavouritesFragment_stops on Stop @relay(plural: true) {
      ...StopNearYouContainer_stop
      gtfsId
      lat
      lon
    }
  `,
  stations: graphql`
    fragment NearYouFavouritesFragment_stations on Stop @relay(plural: true) {
      ...StopNearYouContainer_stop
      gtfsId
      lat
      lon
      stops {
        gtfsId
        desc
      }
    }
  `,
  vehicleStations: graphql`
    fragment NearYouFavouritesFragment_vehicleStations on VehicleRentalStation
    @relay(plural: true) {
      ...VehicleRentalStationNearYou_station
      stationId
      name
      availableVehicles {
        total
      }
      availableSpaces {
        total
      }
      capacity
      rentalNetwork {
        networkId
      }
      lat
      lon
      operative
    }
  `,
};
