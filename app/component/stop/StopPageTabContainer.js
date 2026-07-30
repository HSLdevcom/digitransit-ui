import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { alertShape } from '../../util/shapes';
import StopPageTabs from './StopPageTabs';

function StopPageTabContainer({ children, stop }) {
  return (
    <div className="stop-page-content-wrapper">
      <StopPageTabs stop={stop} />
      {children}
    </div>
  );
}

StopPageTabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  stop: PropTypes.shape({
    alerts: PropTypes.arrayOf(alertShape),
    vehicleMode: PropTypes.string,
    stoptimes: PropTypes.arrayOf(
      PropTypes.shape({
        realtimeState: PropTypes.string,
        trip: PropTypes.shape({
          pattern: PropTypes.shape({
            code: PropTypes.string,
          }),
          route: PropTypes.shape({
            alerts: PropTypes.arrayOf(alertShape),
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
      cancelationStartDate: { type: "LocalDate!" }
      cancelationEndDate: { type: "LocalDate!" }
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
      stops {
        gtfsId
        canceledCalls(
          serviceDateRanges: [
            { start: $cancelationStartDate, end: $cancelationEndDate }
          ]
        ) {
          stopCall {
            stopLocation {
              ... on Stop {
                gtfsId
              }
            }
          }
        }
      }

      canceledCalls(
        serviceDateRanges: [
          { start: $cancelationStartDate, end: $cancelationEndDate }
        ]
      ) {
        tripOnServiceDate {
          trip {
            pattern {
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
  `,
});

export { containerComponent as default, StopPageTabContainer as Component };
