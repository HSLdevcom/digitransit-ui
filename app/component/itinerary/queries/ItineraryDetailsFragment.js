import { graphql } from 'react-relay';

export const ItineraryDetailsFragment = graphql`
  fragment ItineraryDetailsFragment on Itinerary {
    duration
    start
    end
    emissionsPerPerson {
      co2
    }
    legs {
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
      mode
      legGeometry {
        points
      }
      pickupBookingInfo {
        contactInfo {
          bookingUrl
          infoUrl
        }
      }
      steps {
        feature {
          __typename
          ... on Entrance {
            publicCode
            wheelchairAccessible
          }
        }
        lat
        lon
      }
      nextLegs(
        numberOfLegs: 2
        originModesWithParentStation: [RAIL]
        destinationModesWithParentStation: [RAIL]
      ) {
        mode
        distance
        route {
          alerts {
            alertSeverityLevel
          }
          shortName
          mode
          type
          gtfsId
          color
        }
        from {
          stop {
            platformCode
            alerts {
              alertSeverityLevel
            }
          }
        }
        to {
          stop {
            alerts {
              alertSeverityLevel
            }
          }
        }
        start {
          scheduledTime
          estimated {
            time
          }
        }
        trip {
          tripHeadsign
          pattern {
            code
          }
          occupancy {
            occupancyStatus
          }
          gtfsId
        }
        realTime
      }
      ...LegAgencyInfoFragment
      from {
        lat
        lon
        name
        vehicleParking {
          name
          vehicleParkingId
        }
        vehicleRentalStation {
          rentalNetwork {
            networkId
          }
          availableVehicles {
            total
          }
          lat
          lon
          stationId
        }
        rentalVehicle {
          vehicleId
          name
          lat
          lon
          rentalUris {
            android
            ios
            web
          }
          rentalNetwork {
            networkId
            url
          }
        }
        stop {
          gtfsId
          code
          platformCode
          vehicleMode
          zoneId
          alerts {
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
            alertHeaderText
            alertDescriptionText
            entities {
              __typename
              ... on Stop {
                gtfsId
              }
            }
          }
          parentStation {
            gtfsId
          }
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
        rentalVehicle {
          vehicleId
          lat
          lon
          rentalNetwork {
            networkId
          }
        }
        stop {
          gtfsId
          code
          platformCode
          zoneId
          name
          vehicleMode
          alerts {
            alertSeverityLevel
            effectiveEndDate
            effectiveStartDate
            alertHeaderText
            alertDescriptionText
            entities {
              __typename
              ... on Stop {
                gtfsId
              }
            }
          }
          parentStation {
            gtfsId
          }
        }
        vehicleParking {
          vehicleParkingId
          name
        }
      }
      intermediatePlaces {
        arrival {
          scheduledTime
          estimated {
            time
          }
        }
        stop {
          gtfsId
          lat
          lon
          name
          code
          platformCode
          zoneId
          parentStation {
            gtfsId
          }
        }
      }
      realTime
      realtimeState
      transitLeg
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
      interlineWithPreviousLeg
      distance
      duration
      intermediatePlace
      route {
        shortName
        color
        gtfsId
        type
        longName
        desc
        agency {
          gtfsId
          fareUrl
          name
          phone
        }
        alerts {
          alertSeverityLevel
          effectiveEndDate
          effectiveStartDate
          alertHeaderText
          alertDescriptionText
          id
          entities {
            __typename
            ... on Route {
              gtfsId
            }
          }
        }
      }
      trip {
        gtfsId
        tripHeadsign
        pattern {
          code
        }
        stoptimesForDate {
          headsign
          realtimeState
          stop {
            gtfsId
          }
        }
        occupancy {
          occupancyStatus
        }
      }
    }
  }
`;
