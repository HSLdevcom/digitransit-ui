import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { alertShape } from '../../util/shapes';
import StopPageTabs from './StopPageTabs';

function TerminalPageTabContainer({ children, station }) {
  return (
    <div className="stop-page-content-wrapper">
      <StopPageTabs stop={station} />
      {children}
    </div>
  );
}

TerminalPageTabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  station: PropTypes.shape({
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
          }),
        }),
      }),
    ),
  }),
};

TerminalPageTabContainer.defaultProps = {
  station: undefined,
};

const containerComponent = createFragmentContainer(TerminalPageTabContainer, {
  station: graphql`
    fragment TerminalPageTabContainer_station on Stop
    @argumentDefinitions(
      cancelationStartDate: { type: "LocalDate!" }
      cancelationEndDate: { type: "LocalDate!" }
    ) {
      id
      gtfsId
      code
      stops {
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
      alerts(types: [STOP]) {
        id
        alertSeverityLevel
        effectiveEndDate
        effectiveStartDate
        alertHash
      }
      canceledCalls(
        serviceDateRanges: [
          { start: $cancelationStartDate, end: $cancelationEndDate }
        ]
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
  `,
});

export { containerComponent as default, TerminalPageTabContainer as Component };
