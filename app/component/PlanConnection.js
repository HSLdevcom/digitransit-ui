import { graphql } from 'react-relay';

const planConnection = graphql`
  query PlanConnectionQuery(
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
    $after: String
    $first: Int
    $before: String
    $last: Int
  ) {
    plan: planConnection(
      dateTime: $datetime
      numberOfItineraries: $numItineraries
      after: $after
      first: $first
      before: $before
      last: $last
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
        startCursor
        endCursor
      }
      edges {
        ...ItineraryListContainer_planEdges
        node {
          ...ItineraryDetails_itinerary
          startTime
          endTime
          duration
          walkDistance
          emissionsPerPerson {
            co2
          }
          legs {
            ...ItineraryLine_legs
            mode
            distance
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
              rentalVehicle {
                vehicleId
                network
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
