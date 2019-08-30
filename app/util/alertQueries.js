import Relay from 'react-relay/classic';

/**
 * Query for retrieving the full textual content of an Alert.
 */
export const AlertContentQuery = Relay.QL`
  fragment on Alert {
    id
    alertDescriptionText
    alertHash
    alertHeaderText
    alertSeverityLevel
    alertUrl
    effectiveEndDate
    effectiveStartDate
    alertDescriptionTextTranslations {
      language
      text
    }
    alertHeaderTextTranslations {
      language
      text
    }
    alertUrlTranslations {
      language
      text
    }
  }
`;

/**
 * Query for retrieving Alerts related to a Route and the Trip the Alerts may be related to.
 */
export const RouteAlertsQuery = Relay.QL`
  fragment on Route {
    alerts {
      alertSeverityLevel
      effectiveEndDate
      effectiveStartDate
      trip {
        pattern {
          code
        }
      }
    }
  }
`;

/**
 * Query for retrievent Alerts related to a Route, with textual content.
 */
export const RouteAlertsWithContentQuery = Relay.QL`
  fragment on Route {
    alerts {
      ${AlertContentQuery}
      trip {
        pattern {
          code
        }
      }
    }
  }
`;

/**
 * Query for retrieving Alerts related to a Stop.
 */
export const StopAlertsQuery = Relay.QL`
  fragment on Stop {
    alerts {
      alertSeverityLevel
      effectiveEndDate
      effectiveStartDate
    }
  }
`;

/**
 * Query for retrieving Alerts related to a Stop, with textual content.
 */
export const StopAlertsWithContentQuery = Relay.QL`
  fragment on Stop {
    id
    gtfsId
    code
    stops {
      id
      gtfsId
      alerts {
      ${AlertContentQuery}
      }
    }
    alerts {
      ${AlertContentQuery}
    }
  }
`;
