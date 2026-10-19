import { graphql } from 'react-relay';
import './CanceledDeparturesFragment';

export default graphql`
  query CanceledTripsOverviewQuery(
    $runningTimeRanges: [OffsetDateTimeRangeInput!]
    $fetchBus: Boolean!
    $fetchTram: Boolean!
    $fetchRail: Boolean!
    $fetchSubway: Boolean!
    $fetchFerry: Boolean!
  ) {
    bus: canceledTripsSummary(
      filters: {
        include: { modes: [BUS], runningTimeRanges: $runningTimeRanges }
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
            ...CanceledDeparturesFragment
              @arguments(runningTimeRanges: $runningTimeRanges)
          }
        }
      }
    }

    tram: canceledTripsSummary(
      filters: {
        include: { modes: [TRAM], runningTimeRanges: $runningTimeRanges }
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
            ...CanceledDeparturesFragment
              @arguments(runningTimeRanges: $runningTimeRanges)
          }
        }
      }
    }

    rail: canceledTripsSummary(
      filters: {
        include: { modes: [RAIL], runningTimeRanges: $runningTimeRanges }
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
            ...CanceledDeparturesFragment
              @arguments(runningTimeRanges: $runningTimeRanges)
          }
        }
      }
    }

    subway: canceledTripsSummary(
      filters: {
        include: { modes: [SUBWAY], runningTimeRanges: $runningTimeRanges }
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
            ...CanceledDeparturesFragment
              @arguments(runningTimeRanges: $runningTimeRanges)
          }
        }
      }
    }

    ferry: canceledTripsSummary(
      filters: {
        include: { modes: [FERRY], runningTimeRanges: $runningTimeRanges }
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
            ...CanceledDeparturesFragment
              @arguments(runningTimeRanges: $runningTimeRanges)
          }
        }
      }
    }
  }
`;
