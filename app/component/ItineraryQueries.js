import { graphql } from 'react-relay';

export const planConnection = graphql`
  query ItineraryQueries_PlanConnection_Query(
    $fromPlace: PlanLabeledLocationInput!
    $toPlace: PlanLabeledLocationInput!
    $numItineraries: Int
    $modes: [PlanTransitModePreferenceInput!]
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
      modes: {
        directOnly: false
        transitOnly: false
        direct: [WALK]
        transit: {
          access: [WALK]
          transfer: [WALK]
          egress: [WALK]
          transit: $modes
        }
      }
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
        cursor
        node {
          startTime
          endTime
          ...ItineraryDetails_itinerary
          ...ItineraryListContainer_itineraries
          emissionsPerPerson {
            co2
          }
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
              occupancy {
                occupancyStatus
              }
              stoptimesForDate {
                scheduledDeparture
                pickupType
              }
              pattern {
                ...RouteLine_pattern
              }
            }
            from {
              name
              lat
              lon
              stop {
                gtfsId
                zoneId
              }
              vehicleRentalStation {
                stationId
                vehiclesAvailable
                network
              }
            }
            to {
              stop {
                gtfsId
                zoneId
              }
              bikePark {
                bikeParkId
                name
              }
            }
          }
        }
      }
    }
  }
`;

export const planQuery = graphql`
  query ItineraryQueries_Plan_Query(
    $fromPlace: String!
    $toPlace: String!
    $numItineraries: Int!
    $modes: [TransportMode!]
    $date: String!
    $time: String!
    $walkReluctance: Float
    $walkBoardCost: Int
    $minTransferTime: Int
    $walkSpeed: Float
    $wheelchair: Boolean
    $ticketTypes: [String]
    $arriveBy: Boolean
    $transferPenalty: Int
    $bikeSpeed: Float
    $optimize: OptimizeType
    $unpreferred: InputUnpreferred
    $allowedBikeRentalNetworks: [String]
  ) {
    plan: plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      numItineraries: $numItineraries
      transportModes: $modes
      date: $date
      time: $time
      walkReluctance: $walkReluctance
      walkBoardCost: $walkBoardCost
      minTransferTime: $minTransferTime
      walkSpeed: $walkSpeed
      wheelchair: $wheelchair
      allowedTicketTypes: $ticketTypes
      arriveBy: $arriveBy
      transferPenalty: $transferPenalty
      bikeSpeed: $bikeSpeed
      optimize: $optimize
      unpreferred: $unpreferred
      allowedVehicleRentalNetworks: $allowedBikeRentalNetworks
    ) {
      routingErrors {
        code
        inputField
      }
      ...ItineraryListContainer_plan
      itineraries {
        startTime
        endTime
        ...ItineraryDetails_itinerary
        ...ItineraryListContainer_itineraries
        emissionsPerPerson {
          co2
        }
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
            occupancy {
              occupancyStatus
            }
            stoptimesForDate {
              scheduledDeparture
              pickupType
            }
            pattern {
              ...RouteLine_pattern
            }
          }
          from {
            name
            lat
            lon
            stop {
              gtfsId
              zoneId
            }
            vehicleRentalStation {
              stationId
              vehiclesAvailable
              network
            }
          }
          to {
            stop {
              gtfsId
              zoneId
            }
            bikePark {
              bikeParkId
              name
            }
          }
        }
      }
    }
  }
`;

export const alternativeQuery = graphql`
  query ItineraryQueries_Alternative_Query(
    $fromPlace: String!
    $toPlace: String!
    $date: String!
    $time: String!
    $walkReluctance: Float
    $walkBoardCost: Int
    $minTransferTime: Int
    $walkSpeed: Float
    $wheelchair: Boolean
    $ticketTypes: [String]
    $arriveBy: Boolean
    $transferPenalty: Int
    $bikeSpeed: Float
    $optimize: OptimizeType
    $unpreferred: InputUnpreferred
    $shouldMakeWalkQuery: Boolean!
    $shouldMakeBikeQuery: Boolean!
    $shouldMakeCarQuery: Boolean!
    $shouldMakeParkRideQuery: Boolean!
    $showBikeAndPublicItineraries: Boolean!
    $showBikeAndParkItineraries: Boolean!
    $bikeAndPublicModes: [TransportMode!]
    $bikeParkModes: [TransportMode!]
    $parkRideModes: [TransportMode!]
  ) {
    walkPlan: plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      transportModes: [{ mode: WALK }]
      date: $date
      time: $time
      walkSpeed: $walkSpeed
      wheelchair: $wheelchair
      arriveBy: $arriveBy
    ) @include(if: $shouldMakeWalkQuery) {
      ...ItineraryListContainer_plan
      itineraries {
        walkDistance
        duration
        startTime
        endTime
        ...ItineraryDetails_itinerary
        ...ItineraryListContainer_itineraries
        legs {
          mode
          ...ItineraryLine_legs
          legGeometry {
            points
          }
          distance
        }
      }
    }
    bikePlan: plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      transportModes: [{ mode: BICYCLE }]
      date: $date
      time: $time
      walkSpeed: $walkSpeed
      arriveBy: $arriveBy
      bikeSpeed: $bikeSpeed
      optimize: $optimize
    ) @include(if: $shouldMakeBikeQuery) {
      ...ItineraryListContainer_plan
      itineraries {
        duration
        startTime
        endTime
        ...ItineraryDetails_itinerary
        ...ItineraryListContainer_itineraries
        legs {
          mode
          ...ItineraryLine_legs
          legGeometry {
            points
          }
          distance
        }
      }
    }
    bikeAndPublicPlan: plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      numItineraries: 6
      transportModes: $bikeAndPublicModes
      date: $date
      time: $time
      walkReluctance: $walkReluctance
      walkBoardCost: $walkBoardCost
      minTransferTime: $minTransferTime
      walkSpeed: $walkSpeed
      allowedTicketTypes: $ticketTypes
      arriveBy: $arriveBy
      transferPenalty: $transferPenalty
      bikeSpeed: $bikeSpeed
      optimize: $optimize
      unpreferred: $unpreferred
    ) @include(if: $showBikeAndPublicItineraries) {
      ...ItineraryListContainer_plan
      itineraries {
        duration
        startTime
        endTime
        ...ItineraryDetails_itinerary
        ...ItineraryListContainer_itineraries
        emissionsPerPerson {
          co2
        }
        legs {
          mode
          ...ItineraryLine_legs
          transitLeg
          legGeometry {
            points
          }
          route {
            gtfsId
            type
            shortName
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
          distance
        }
      }
    }
    bikeParkPlan: plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      numItineraries: 6
      transportModes: $bikeParkModes
      date: $date
      time: $time
      walkReluctance: $walkReluctance
      walkBoardCost: $walkBoardCost
      minTransferTime: $minTransferTime
      walkSpeed: $walkSpeed
      allowedTicketTypes: $ticketTypes
      arriveBy: $arriveBy
      transferPenalty: $transferPenalty
      bikeSpeed: $bikeSpeed
      optimize: $optimize
      unpreferred: $unpreferred
    ) @include(if: $showBikeAndParkItineraries) {
      ...ItineraryListContainer_plan
      itineraries {
        duration
        startTime
        endTime
        ...ItineraryDetails_itinerary
        ...ItineraryListContainer_itineraries
        emissionsPerPerson {
          co2
        }
        legs {
          mode
          ...ItineraryLine_legs
          transitLeg
          legGeometry {
            points
          }
          route {
            gtfsId
            type
            shortName
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
          to {
            bikePark {
              bikeParkId
              name
            }
          }
          distance
        }
      }
    }
    carPlan: plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      numItineraries: 5
      transportModes: [{ mode: CAR }]
      date: $date
      time: $time
      walkReluctance: $walkReluctance
      walkBoardCost: $walkBoardCost
      minTransferTime: $minTransferTime
      walkSpeed: $walkSpeed
      allowedTicketTypes: $ticketTypes
      arriveBy: $arriveBy
      transferPenalty: $transferPenalty
      bikeSpeed: $bikeSpeed
      optimize: $optimize
      unpreferred: $unpreferred
    ) @include(if: $shouldMakeCarQuery) {
      ...ItineraryListContainer_plan
      itineraries {
        duration
        startTime
        endTime
        ...ItineraryDetails_itinerary
        ...ItineraryListContainer_itineraries
        emissionsPerPerson {
          co2
        }
        legs {
          mode
          ...ItineraryLine_legs
          transitLeg
          legGeometry {
            points
          }
          route {
            gtfsId
            type
            shortName
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
          to {
            bikePark {
              bikeParkId
              name
            }
          }
          distance
        }
      }
    }
    parkRidePlan: plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      numItineraries: 5
      transportModes: $parkRideModes
      date: $date
      time: $time
      walkReluctance: $walkReluctance
      walkBoardCost: $walkBoardCost
      minTransferTime: $minTransferTime
      walkSpeed: $walkSpeed
      allowedTicketTypes: $ticketTypes
      arriveBy: $arriveBy
      transferPenalty: $transferPenalty
      bikeSpeed: $bikeSpeed
      optimize: $optimize
      unpreferred: $unpreferred
    ) @include(if: $shouldMakeParkRideQuery) {
      ...ItineraryListContainer_plan
      itineraries {
        duration
        startTime
        endTime
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
            type
            shortName
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
          to {
            carPark {
              carParkId
              name
            }
            name
          }
          distance
        }
      }
    }
  }
`;
