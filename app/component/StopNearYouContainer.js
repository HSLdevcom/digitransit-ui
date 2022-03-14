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
          alertDescriptionTextTranslations {
            text
            language
          }
        }
        zoneId
        platformCode
        stoptimesWithoutPatterns(
          startTime: $startTime
          omitNonPickups: $omitNonPickups
        ) {
          realtimeArrival
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
            alertDescriptionTextTranslations {
              text
              language
            }
          }
          stoptimesWithoutPatterns(
            startTime: $startTime
            omitNonPickups: $omitNonPickups
          ) {
            stop {
              platformCode
            }
            realtimeArrival
            realtime
            serviceDay
            headsign
            trip {
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
