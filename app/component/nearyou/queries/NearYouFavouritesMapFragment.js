import { graphql } from 'react-relay';

export default {
  stops: graphql`
    fragment NearYouFavouritesMapFragment_stops on Stop @relay(plural: true) {
      gtfsId
      lat
      lon
      patterns {
        route {
          gtfsId
          shortName
          mode
          type
        }
        code
        patternGeometry {
          points
        }
      }
    }
  `,
  stations: graphql`
    fragment NearYouFavouritesMapFragment_stations on Stop
    @relay(plural: true) {
      gtfsId
      lat
      lon
      stops {
        patterns {
          route {
            gtfsId
            shortName
            mode
            type
          }
          code
          patternGeometry {
            points
          }
        }
      }
    }
  `,
  vehicleStations: graphql`
    fragment NearYouFavouritesMapFragment_vehicleStations on VehicleRentalStation
    @relay(plural: true) {
      name
      lat
      lon
      stationId
    }
  `,
};
