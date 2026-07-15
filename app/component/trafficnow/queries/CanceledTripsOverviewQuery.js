import { graphql } from 'react-relay';

export default graphql`
  query CanceledTripsOverviewQuery(
    $serviceDateRanges: [LocalDateRangeInput!]!
    $fetchBus: Boolean!
    $fetchTram: Boolean!
    $fetchRail: Boolean!
    $fetchSubway: Boolean!
    $fetchFerry: Boolean!
  ) {
    bus: canceledTripsSummary(
      filters: {
        include: { modes: [BUS], serviceDateRanges: $serviceDateRanges }
      }
    ) @include(if: $fetchBus) {
      routes {
        cancellationCount
        route {
          id
          gtfsId
          shortName
          mode
        }
        patterns {
          cancellationCount
          pattern {
            code
            headsign
          }
        }
      }
    }

    tram: canceledTripsSummary(
      filters: {
        include: { modes: [TRAM], serviceDateRanges: $serviceDateRanges }
      }
    ) @include(if: $fetchTram) {
      routes {
        cancellationCount
        route {
          id
          gtfsId
          shortName
          mode
        }
        patterns {
          cancellationCount
          pattern {
            code
            headsign
          }
        }
      }
    }

    rail: canceledTripsSummary(
      filters: {
        include: { modes: [RAIL], serviceDateRanges: $serviceDateRanges }
      }
    ) @include(if: $fetchRail) {
      routes {
        cancellationCount
        route {
          id
          gtfsId
          shortName
          mode
        }
        patterns {
          cancellationCount
          pattern {
            code
            headsign
          }
        }
      }
    }

    subway: canceledTripsSummary(
      filters: {
        include: { modes: [SUBWAY], serviceDateRanges: $serviceDateRanges }
      }
    ) @include(if: $fetchSubway) {
      routes {
        cancellationCount
        route {
          id
          gtfsId
          shortName
          mode
        }
        patterns {
          cancellationCount
          pattern {
            code
            headsign
          }
        }
      }
    }

    ferry: canceledTripsSummary(
      filters: {
        include: { modes: [FERRY], serviceDateRanges: $serviceDateRanges }
      }
    ) @include(if: $fetchFerry) {
      routes {
        cancellationCount
        route {
          id
          gtfsId
          shortName
          mode
        }
        patterns {
          cancellationCount
          pattern {
            code
            headsign
          }
        }
      }
    }
  }
`;
