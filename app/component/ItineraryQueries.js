import { graphql } from 'react-relay';

/**
 * Generic plan query.
 */
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
    $modeWeight: InputModeWeight
  ) {
    viewer {
      ...ItineraryQueries_Plan_Viewer
        @arguments(
          fromPlace: $fromPlace
          toPlace: $toPlace
          numItineraries: $numItineraries
          modes: $modes
          date: $date
          time: $time
          walkReluctance: $walkReluctance
          walkBoardCost: $walkBoardCost
          minTransferTime: $minTransferTime
          walkSpeed: $walkSpeed
          wheelchair: $wheelchair
          ticketTypes: $ticketTypes
          arriveBy: $arriveBy
          transferPenalty: $transferPenalty
          bikeSpeed: $bikeSpeed
          optimize: $optimize
          unpreferred: $unpreferred
          allowedBikeRentalNetworks: $allowedBikeRentalNetworks
          modeWeight: $modeWeight
        )
    }

    serviceTimeRange {
      ...ItineraryPage_serviceTimeRange
    }
  }
`;

export const walkAndBikeQuery = graphql`
  query ItineraryQueries_WalkBike_Query(
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
      ...ItineraryDetails_plan
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
      ...ItineraryDetails_plan
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
      ...ItineraryDetails_plan
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
      ...ItineraryDetails_plan
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
      ...ItineraryDetails_plan
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
      transportModes: [{ mode: CAR, qualifier: PARK }, { mode: TRANSIT }]
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
      ...ItineraryDetails_plan
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

export const moreQuery = graphql`
  query ItineraryQueries_More_Query(
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
      ...ItineraryDetails_plan
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

export const viewerQuery = graphql`
  fragment ItineraryQueries_Plan_Viewer on QueryType
  @argumentDefinitions(
    fromPlace: { type: "String!" }
    toPlace: { type: "String!" }
    numItineraries: { type: "Int!" }
    modes: { type: "[TransportMode!]" }
    date: { type: "String!" }
    time: { type: "String!" }
    walkReluctance: { type: "Float" }
    walkBoardCost: { type: "Int" }
    minTransferTime: { type: "Int" }
    walkSpeed: { type: "Float" }
    wheelchair: { type: "Boolean" }
    ticketTypes: { type: "[String]" }
    arriveBy: { type: "Boolean" }
    transferPenalty: { type: "Int" }
    bikeSpeed: { type: "Float" }
    optimize: { type: "OptimizeType" }
    unpreferred: { type: "InputUnpreferred" }
    allowedBikeRentalNetworks: { type: "[String]" }
    modeWeight: { type: "InputModeWeight" }
  ) {
    plan(
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
      modeWeight: $modeWeight
    ) {
      ...ItineraryListContainer_plan
      ...ItineraryDetails_plan
      routingErrors {
        code
        inputField
      }
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
            type
            shortName
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
