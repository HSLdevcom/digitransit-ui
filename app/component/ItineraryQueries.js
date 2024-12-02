import { graphql } from 'react-relay';

/**
 * Generic plan query.
 */
export const planQuery = graphql`
  query ItineraryQueries_ItineraryPage_Query(
    $fromPlace: String!
    $toPlace: String!
    $intermediatePlaces: [InputCoordinates!]
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
    $itineraryFiltering: Float
    $unpreferred: InputUnpreferred
    $allowedVehicleRentalNetworks: [String]
    $locale: String
    $modeWeight: InputModeWeight
  ) {
    viewer {
      ...ItineraryPage_viewer
      @arguments(
        fromPlace: $fromPlace
        toPlace: $toPlace
        intermediatePlaces: $intermediatePlaces
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
        itineraryFiltering: $itineraryFiltering
        unpreferred: $unpreferred
        allowedVehicleRentalNetworks: $allowedVehicleRentalNetworks
        locale: $locale
        modeWeight: $modeWeight
      )
    }

    serviceTimeRange {
      ...ItineraryPage_serviceTimeRange
    }
  }
`;

export const moreItinerariesQuery = graphql`
  query ItineraryQueries_ItineraryPage_moreItins_Query(
    $fromPlace: String!
    $toPlace: String!
    $intermediatePlaces: [InputCoordinates!]
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
    $itineraryFiltering: Float
    $unpreferred: InputUnpreferred
    $allowedVehicleRentalNetworks: [String]
    $locale: String
  ) {
    plan(
      fromPlace: $fromPlace
      toPlace: $toPlace
      intermediatePlaces: $intermediatePlaces
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
      itineraryFiltering: $itineraryFiltering
      unpreferred: $unpreferred
      allowedVehicleRentalNetworks: $allowedVehicleRentalNetworks
      locale: $locale
    ) {
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
            shortName
            type
          }
          trip {
            gtfsId
            directionId
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
            bikeRentalStation {
              bikesAvailable
              networks
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
            carPark {
              carParkId
              name
            }
          }
        }
      }
    }
  }
`;
