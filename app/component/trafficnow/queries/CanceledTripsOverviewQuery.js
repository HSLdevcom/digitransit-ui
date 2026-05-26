import { graphql } from 'react-relay';
import './CanceledTripsOverviewFragment';

export default graphql`
  query CanceledTripsOverviewQuery(
    $amount: Int!
    $fetchBus: Boolean!
    $fetchTram: Boolean!
    $fetchRail: Boolean!
    $fetchSubway: Boolean!
    $fetchFerry: Boolean!
  ) {
    bus: canceledTrips(first: $amount, filters: { include: { modes: [BUS] } })
      @include(if: $fetchBus) {
      ...CanceledTripsOverviewFragment @relay(mask: false)
    }

    tram: canceledTrips(
      first: $amount
      filters: { include: { modes: [TRAM] } }
    ) @include(if: $fetchTram) {
      ...CanceledTripsOverviewFragment @relay(mask: false)
    }

    rail: canceledTrips(
      first: $amount
      filters: { include: { modes: [RAIL] } }
    ) @include(if: $fetchRail) {
      ...CanceledTripsOverviewFragment @relay(mask: false)
    }

    subway: canceledTrips(
      first: $amount
      filters: { include: { modes: [SUBWAY] } }
    ) @include(if: $fetchSubway) {
      ...CanceledTripsOverviewFragment @relay(mask: false)
    }

    ferry: canceledTrips(
      first: $amount
      filters: { include: { modes: [FERRY] } }
    ) @include(if: $fetchFerry) {
      ...CanceledTripsOverviewFragment @relay(mask: false)
    }
  }
`;
