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
            platformCode
          }
          scheduledDeparture
        }
        stoptimesForDate {
          serviceDay
          scheduledDeparture
          stop {
            gtfsId
            platformCode
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
          platformCode
        }
        vehicleRentalStation {
          availableVehicles {
            total
          }
          rentalNetwork {
            networkId
          }
        }
        viaLocationType
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
          vehicleParkingId
        }
        viaLocationType
      }
      fareProducts {
        id
        product {
          id
          ... on DefaultFareProduct {
            price {
              amount
            }
          }
        }
      }
    }
  }
`;
