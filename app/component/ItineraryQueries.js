import { graphql } from 'react-relay';

const planConnection = graphql`
  query ItineraryQueries_PlanConnection_Query(
    $fromPlace: PlanLabeledLocationInput!
    $toPlace: PlanLabeledLocationInput!
    $numItineraries: Int
    $modes: PlanModesInput!
    $datetime: PlanDateTimeInput!
    $walkReluctance: Reluctance
    $walkBoardCost: Cost
    $minTransferTime: Duration
    $walkSpeed: Speed
    $wheelchair: Boolean
    $transferPenalty: Cost
    $bikeSpeed: Speed
    $allowedBikeRentalNetworks: [String!]
  ) {
    plan: planConnection(
      dateTime: $datetime
      searchWindow: "PT20M"
      numberOfItineraries: $numItineraries
      origin: $fromPlace
      destination: $toPlace
      modes: $modes
      preferences: {
        accessibility: { wheelchair: { enabled: $wheelchair } }
        street: {
          bicycle: {
            speed: $bikeSpeed
            rental: { allowedNetworks: $allowedBikeRentalNetworks }
          }
          walk: {
            speed: $walkSpeed
            reluctance: $walkReluctance
            boardCost: $walkBoardCost
          }
        }
        transit: {
          transfer: { cost: $transferPenalty, slack: $minTransferTime }
        }
      }
    ) {
      searchDateTime
      routingErrors {
        code
        inputField
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          startTime
          ...ItineraryDetails_itinerary
          ...ItineraryListContainer_itineraries
          legs {
            mode
            ...ItineraryLine_legs
            transitLeg
            legGeometry {
              points
            }
            route {
              gtfsId
            }
            trip {
              gtfsId
              directionId
              stoptimesForDate {
                scheduledDeparture
              }
              pattern {
                ...RouteLine_pattern
              }
            }
            from {
              lat
              lon
              stop {
                gtfsId
              }
              vehicleRentalStation {
                stationId
              }
            }
            to {
              lat
              lon
              stop {
                gtfsId
              }
            }
          }
        }
      }
    }
  }
`;

export default planConnection;
