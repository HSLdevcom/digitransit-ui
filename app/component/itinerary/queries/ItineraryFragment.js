import { graphql } from 'react-relay';

export const ItineraryFragment = graphql`
  fragment ItineraryFragment on Itinerary {
    start
    end
    emissionsPerPerson {
      co2
    }
    legs {
      realTime
      realtimeState
      transitLeg
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
      mode
      distance
      duration
      rentedBike
      interlineWithPreviousLeg
      intermediatePlace
      intermediatePlaces {
        stop {
          zoneId
          gtfsId
          parentStation {
            gtfsId
          }
        }
        arrival {
          scheduledTime
          estimated {
            time
          }
        }
      }
      route {
        gtfsId
        mode
        shortName
        type
        color
        agency {
          name
        }
        alerts {
          alertSeverityLevel
          effectiveEndDate
          effectiveStartDate
        }
      }
      trip {
        gtfsId
        stoptimes {
          stop {
            gtfsId
          }
        }
        occupancy {
          occupancyStatus
        }
      }
      from {
        lat
        lon
        name
        stop {
          gtfsId
          parentStation {
            gtfsId
          }
          zoneId
          alerts {
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
          }
        }
        vehicleRentalStation {
          availableVehicles {
            total
          }
          rentalNetwork {
            networkId
          }
        }
      }
      to {
        stop {
          gtfsId
          parentStation {
            gtfsId
          }
          zoneId
          alerts {
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
          }
        }
        vehicleParking {
          name
        }
      }
    }
  }
`;
