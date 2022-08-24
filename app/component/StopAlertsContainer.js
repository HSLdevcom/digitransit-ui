import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import StopAlerts from './StopAlerts';
import { otpServiceAlertShape } from '../util/alertUtils.ts';

const StopAlertsContainer = ({ stop }) => {
  return <StopAlerts stop={stop} />;
};

StopAlertsContainer.propTypes = {
  stop: PropTypes.shape({
    alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
    stoptimes: PropTypes.arrayOf(
      PropTypes.shape({
        headsign: PropTypes.string.isRequired,
        realtimeState: PropTypes.string,
        scheduledDeparture: PropTypes.number,
        serviceDay: PropTypes.number,
        trip: PropTypes.shape({
          pattern: PropTypes.shape({
            code: PropTypes.string,
          }),
          route: PropTypes.shape({
            alerts: PropTypes.arrayOf(otpServiceAlertShape).isRequired,
            color: PropTypes.string,
            mode: PropTypes.string.isRequired,
            shortName: PropTypes.string.isRequired,
          }).isRequired,
          stops: PropTypes.arrayOf(
            PropTypes.shape({
              name: PropTypes.string,
            }),
          ).isRequired,
        }).isRequired,
      }),
    ).isRequired,
  }).isRequired,
};

const containerComponent = createFragmentContainer(StopAlertsContainer, {
  stop: graphql`
    fragment StopAlertsContainer_stop on Stop
    @argumentDefinitions(
      startTime: { type: "Long" }
      timeRange: { type: "Int", defaultValue: 900 }
      date: { type: "String" }
    ) {
      routes {
        gtfsId
        shortName
        longName
        mode
        type
        color
        alerts {
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
          trip {
            pattern {
              code
            }
          }
        }
      }
      id
      gtfsId
      code
      name
      stops {
        id
        gtfsId
        alerts {
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
      }
      alerts {
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
      stoptimes: stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: $timeRange
        numberOfDepartures: 100
        omitCanceled: false
      ) {
        headsign
        realtimeState
        scheduledDeparture
        serviceDay
        trip {
          pattern {
            code
          }
          route {
            color
            mode
            type
            shortName
            gtfsId
            alerts {
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
              trip {
                pattern {
                  code
                }
              }
            }
          }
          stops {
            name
          }
        }
      }
    }
  `,
});

export { containerComponent as default, StopAlertsContainer as Component };
