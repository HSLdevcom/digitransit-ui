import { graphql, createRefetchContainer } from 'react-relay';
import StopNearYou from './StopNearYou';

const containerComponent = createRefetchContainer(
  StopNearYou,
  {
    stop: graphql`
      fragment StopNearYouContainer_stop on Stop
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        omitNonPickups: { type: "Boolean!", defaultValue: false }
      ) {
        id
        name
        gtfsId
        code
        desc
        lat
        lon
        alerts {
          alertSeverityLevel
          alertDescriptionText
          alertHeaderText
          entities {
            __typename
          }
        }
        zoneId
        platformCode
        stoptimesWithoutPatterns(
          startTime: $startTime
          omitNonPickups: $omitNonPickups
        ) {
          realtimeDeparture
          realtime
          realtimeState
          serviceDay
          headsign
          stop {
            platformCode
          }
          trip {
            gtfsId
            tripHeadsign
            occupancy {
              occupancyStatus
            }
            pattern {
              code
              route {
                gtfsId
              }
            }
            route {
              alerts {
                alertSeverityLevel
              }
              type
              shortName
              longName
              gtfsId
              mode
              color
              patterns {
                headsign
              }
            }
          }
        }
        parentStation {
          id
          name
          gtfsId
          code
          desc
          lat
          lon
          zoneId
          platformCode
          alerts {
            alertSeverityLevel
            alertDescriptionText
          }
          stoptimesWithoutPatterns(
            startTime: $startTime
            omitNonPickups: $omitNonPickups
          ) {
            stop {
              platformCode
            }
            realtimeDeparture
            realtime
            serviceDay
            headsign
            trip {
              occupancy {
                occupancyStatus
              }
              gtfsId
              pattern {
                code
                route {
                  gtfsId
                }
              }
              route {
                alerts {
                  alertSeverityLevel
                }
                type
                shortName
                longName
                gtfsId
                mode
                patterns {
                  headsign
                }
              }
            }
          }
        }
      }
    `,
  },
  graphql`
    query StopNearYouContainerRefetchQuery(
      $stopId: String!
      $startTime: Long!
      $omitNonPickups: Boolean!
    ) {
      stop(id: $stopId) {
        ...StopNearYouContainer_stop
        @arguments(startTime: $startTime, omitNonPickups: $omitNonPickups)
      }
    }
  `,
);

export default containerComponent;
