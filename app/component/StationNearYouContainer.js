import { graphql, createRefetchContainer } from 'react-relay';
import StopNearYou from './StopNearYou';

const containerComponent = createRefetchContainer(
  StopNearYou,
  {
    stop: graphql`
      fragment StationNearYouContainer_stop on Stop
      @argumentDefinitions(startTime: { type: "Long!", defaultValue: 0 }) {
        id
        name
        gtfsId
        code
        desc
        lat
        lon
        zoneId
        platformCode
        vehicleMode
        stoptimesWithoutPatterns(startTime: $startTime) {
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
          stop {
            platformCode
          }
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
          vehicleMode
          stoptimesWithoutPatterns(startTime: $startTime) {
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
            stop {
              platformCode
            }
          }
        }
      }
    `,
  },
  graphql`
    query StationNearYouContainerRefetchQuery(
      $stopId: String!
      $startTime: Long!
    ) {
      station(id: $stopId) {
        ...StopNearYouContainer_stop @arguments(startTime: $startTime)
      }
    }
  `,
);

export default containerComponent;
