import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import { AlertShape } from '../util/shapes';
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
    alerts: PropTypes.arrayOf(AlertShape),
    vehicleMode: PropTypes.string,
    stoptimes: PropTypes.arrayOf(
      PropTypes.shape({
        realtimeState: PropTypes.string,
        trip: PropTypes.shape({
          pattern: PropTypes.shape({
            code: PropTypes.string,
          }),
          route: PropTypes.shape({
            alerts: PropTypes.arrayOf(AlertShape),
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
      timeRange: { type: "Int", defaultValue: 3600 }
    ) {
      id
      gtfsId
      code
      alerts(types: [STOP, ROUTES]) {
        id
        alertSeverityLevel
        effectiveEndDate
        effectiveStartDate
      }
      stoptimes: stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: $timeRange
        numberOfDepartures: 100
        omitCanceled: false
      ) {
        realtimeState
      }
    }
  `,
});

export { containerComponent as default, StopPageTabContainer as Component };
