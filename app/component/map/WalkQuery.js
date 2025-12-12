import { graphql } from 'react-relay';

const walkQuery = graphql`
  query WalkQuery(
    $origin: PlanLabeledLocationInput!
    $destination: PlanLabeledLocationInput!
    $walkSpeed: Speed
    $wheelchair: Boolean
  ) {
    plan: planConnection(
      first: 1
      origin: $origin
      destination: $destination
      modes: { directOnly: true, direct: [WALK] }
      preferences: {
        accessibility: { wheelchair: { enabled: $wheelchair } }
        street: { walk: { speed: $walkSpeed } }
      }
    ) {
      edges {
        node {
          legs {
            mode
            rentedBike
            start {
              scheduledTime
              estimated {
                time
              }
            }
            end {
              scheduledTime
              estimated {
                time
              }
            }
            duration
            distance
            legGeometry {
              points
            }
            steps {
              feature {
                __typename
                ... on Entrance {
                  publicCode
                  wheelchairAccessible
                }
                ... on ElevatorUse {
                  from {
                    level
                    name
                  }
                  verticalDirection
                  to {
                    level
                    name
                  }
                }
                ... on EscalatorUse {
                  from {
                    level
                    name
                  }
                  verticalDirection
                  to {
                    level
                    name
                  }
                }
                ... on StairsUse {
                  from {
                    level
                    name
                  }
                  verticalDirection
                  to {
                    level
                    name
                  }
                }
              }
              lat
              lon
            }
            transitLeg
            interlineWithPreviousLeg
            route {
              gtfsId
              shortName
              color
              type
              agency {
                name
              }
            }
            from {
              lat
              lon
              name
              vehicleRentalStation {
                lat
                lon
                stationId
                rentalNetwork {
                  networkId
                }
                availableVehicles {
                  total
                }
              }
              rentalVehicle {
                vehicleId
                rentalNetwork {
                  networkId
                }
              }
              stop {
                gtfsId
                code
                platformCode
                vehicleMode
              }
            }
            to {
              lat
              lon
              name
              vehicleRentalStation {
                lat
                lon
                stationId
                rentalNetwork {
                  networkId
                }
                availableVehicles {
                  total
                }
              }
              stop {
                gtfsId
                code
                platformCode
                vehicleMode
              }
            }
            intermediatePlaces {
              stop {
                gtfsId
                lat
                lon
                name
                platformCode
              }
            }
          }
        }
      }
    }
  }
`;

export { walkQuery };
