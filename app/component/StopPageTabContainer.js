import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import StopPageTabs from './StopPageTabs';

function StopPageTabContainer({ children, stop }) {
  return (
    <div className="stop-page-content-wrapper">
      <StopPageTabs stop={stop} />
      {children}
    </div>
  );
}

const alertArrayShape = PropTypes.arrayOf(
  PropTypes.shape({ alertSeverityLevel: PropTypes.string }),
);

StopPageTabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  stop: PropTypes.shape({
    alerts: alertArrayShape,
    vehicleMode: PropTypes.string,
    stoptimes: PropTypes.arrayOf(
      PropTypes.shape({
        realtimeState: PropTypes.string,
        trip: PropTypes.shape({
          pattern: PropTypes.shape({
            code: PropTypes.string,
          }),
          route: PropTypes.shape({
            alerts: alertArrayShape,
            trip: PropTypes.shape({
              pattern: PropTypes.shape({
                code: PropTypes.string,
              }),
            }),
          }),
        }),
      }),
    ),
  }),
};

StopPageTabContainer.defaultProps = {
  stop: undefined,
};

const containerComponent = createFragmentContainer(StopPageTabContainer, {
  stop: graphql`
    fragment StopPageTabContainer_stop on Stop
    @argumentDefinitions(
      startTime: { type: "Long" }
      timeRange: { type: "Int", defaultValue: 900 }
    ) {
      id
      gtfsId
      code
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
      vehicleMode
      stoptimes: stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: $timeRange
        numberOfDepartures: 100
        omitCanceled: false
      ) {
        realtimeState
        trip {
          pattern {
            code
          }
          route {
            gtfsId
            shortName
            longName
            mode
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
        }
      }
      routes {
        gtfsId
        shortName
        longName
        mode
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
        patterns {
          code
        }
      }
    }
  `,
});

export { containerComponent as default, StopPageTabContainer as Component };
