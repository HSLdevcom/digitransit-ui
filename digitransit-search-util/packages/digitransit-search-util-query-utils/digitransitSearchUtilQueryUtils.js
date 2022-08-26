import { graphql } from 'react-relay';

export const stopsQuery = graphql`
  query digitransitSearchUtilQueryUtilsStopsQuery($ids: [String!]!) {
    stops(ids: $ids) {
      gtfsId
      lat
      lon
      name
      code
      stoptimesWithoutPatterns(numberOfDepartures: 1) {
        trip {
          route {
            mode
          }
        }
      }
    }
  }
`;

export const stationsQuery = graphql`
  query digitransitSearchUtilQueryUtilsStationsQuery($ids: [String!]!) {
    stations(ids: $ids) {
      gtfsId
      lat
      lon
      name
      code
      stoptimesWithoutPatterns(numberOfDepartures: 1) {
        trip {
          route {
            mode
          }
        }
      }
    }
  }
`;

export const alertsQuery = graphql`
  query digitransitSearchUtilQueryUtilsAlertsQuery($feedIds: [String!]) {
    alerts(severityLevel: [SEVERE], feeds: $feedIds) {
      route {
        mode
      }
      effectiveStartDate
      effectiveEndDate
    }
  }
`;

export const searchBikeRentalStationsQuery = graphql`
  query digitransitSearchUtilQueryUtilsSearchBikeRentalStationsQuery {
    bikeRentalStations {
      name
      stationId
      lon
      lat
    }
  }
`;

export const searchRoutesQuery = graphql`
  query digitransitSearchUtilQueryUtilsSearchRoutesQuery(
    $feeds: [String!]!
    $name: String
    $modes: [Mode]
  ) {
    viewer {
      routes(feeds: $feeds, name: $name, transportModes: $modes) {
        gtfsId
        agency {
          name
        }
        type
        shortName
        mode
        longName
        patterns {
          code
        }
      }
    }
  }
`;

export const favouriteStationsQuery = graphql`
  query digitransitSearchUtilQueryUtilsFavouriteStationsQuery(
    $ids: [String!]!
  ) {
    stations(ids: $ids) {
      gtfsId
      lat
      lon
      name
    }
  }
`;

export const favouriteStopsQuery = graphql`
  query digitransitSearchUtilQueryUtilsFavouriteStopsQuery($ids: [String!]!) {
    stops(ids: $ids) {
      gtfsId
      lat
      lon
      name
      code
    }
  }
`;

export const favouriteRoutesQuery = graphql`
  query digitransitSearchUtilQueryUtilsFavouriteRoutesQuery($ids: [String!]!) {
    routes(ids: $ids) {
      gtfsId
      agency {
        name
      }
      shortName
      mode
      longName
      patterns {
        code
      }
    }
  }
`;

export const favouriteBikeRentalQuery = graphql`
  query digitransitSearchUtilQueryUtilsFavouriteBikeRentalStationsQuery(
    $ids: [String!]!
  ) {
    bikeRentalStations(ids: $ids) {
      name
      stationId
      lat
      lon
    }
  }
`;
