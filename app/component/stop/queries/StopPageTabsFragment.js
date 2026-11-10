import { graphql } from 'react-relay';

export const StopPageTabsFragment = graphql`
  fragment StopPageTabsFragment on Stop
  @argumentDefinitions(
    isTerminal: { type: "Boolean!" }
    cancelationStartDate: { type: "OffsetDateTime!" }
    cancelationEndDate: { type: "OffsetDateTime!" }
  ) {
    id
    gtfsId
    code
    alerts(types: [STOP, ROUTES]) {
      id
      alertSeverityLevel
      effectiveEndDate
      effectiveStartDate
      alertHash
    }
    stops @include(if: $isTerminal) {
      id
      gtfsId
      alerts(types: [STOP, ROUTES]) {
        id
        alertSeverityLevel
        effectiveEndDate
        effectiveStartDate
        alertHash
      }
    }
    canceledCalls(
      timeRanges: [{ start: $cancelationStartDate, end: $cancelationEndDate }]
    ) {
      tripOnServiceDate {
        serviceDate
        trip {
          pattern {
            code
            stops {
              gtfsId
            }
          }
        }
      }
      stopCall {
        stopLocation {
          ... on Stop {
            gtfsId
          }
        }
      }
    }
  }
`;
