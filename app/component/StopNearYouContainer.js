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
          scheduledArrival
          realtimeArrival
          arrivalDelay
          scheduledDeparture
          realtimeDeparture
          departureDelay
          realtime
          realtimeState
          serviceDay
          headsign
          trip {
            tripHeadsign
            route {
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
            scheduledArrival
            realtimeArrival
            arrivalDelay
            scheduledDeparture
            realtimeDeparture
            departureDelay
            realtime
            realtimeState
            serviceDay
            headsign
            trip {
              route {
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
