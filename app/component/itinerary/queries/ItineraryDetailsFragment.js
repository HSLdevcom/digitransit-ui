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
      pickupType
      pickupBookingInfo {
        contactInfo {
          bookingUrl
          infoUrl
          phoneNumber
        }
        message
        latestBookingTime {
          daysPrior
          time
        }
        minimumBookingNotice
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
            effectiveStartDate
            effectiveEndDate
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
              effectiveStartDate
              effectiveEndDate
            }
          }
        }
        to {
          stop {
            alerts {
              alertSeverityLevel
              effectiveStartDate
              effectiveEndDate
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
          isReplacement
          tripShortName
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
        viaLocationType
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
        viaLocationType
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
      route {
        shortName
        color
        gtfsId
        type
        longName
        desc
        url
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
        isReplacement
        tripShortName
        pattern {
          code
        }
        stoptimesForDate {
          headsign
          realtimeState
          serviceDay
          scheduledDeparture
          stop {
            gtfsId
            platformCode
          }
        }
        stoptimes {
          stop {
            platformCode
          }
          scheduledDeparture
        }
        occupancy {
          occupancyStatus
        }
      }
    }
  }
`;
