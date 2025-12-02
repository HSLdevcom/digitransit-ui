import { graphql } from 'react-relay';

export const TimetableFragment = graphql`
  fragment TimetableFragment on Stop
  @argumentDefinitions(date: { type: "String" }) {
    gtfsId
    name
    url
    locationType
    stoptimesForServiceDate(date: $date, omitCanceled: false) {
      pattern {
        headsign
        code
        route {
          id
          shortName
          longName
          type
          mode
          agency {
            id
            name
          }
        }
      }
      stoptimes {
        realtimeState
        scheduledDeparture
        serviceDay
        headsign
        pickupType
        stop {
          gtfsId
        }
      }
    }
  }
`;
