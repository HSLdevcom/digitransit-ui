import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import StopRoutesAndPlatforms from './StopRoutesAndPlatforms';

const StopRoutesAndPlatformsContainer = props => {
  return <StopRoutesAndPlatforms stop={props.stop} />;
};

StopRoutesAndPlatformsContainer.propTypes = {
  stop: PropTypes.object.isRequired,
};

const withRelayContainer = createFragmentContainer(
  StopRoutesAndPlatformsContainer,
  {
    stop: graphql`
      fragment StopRoutesAndPlatformsContainer_stop on Stop {
        gtfsId
        name
        platformCode
        stoptimesForPatterns(numberOfDepartures: 1, timeRange: 604800) {
          pattern {
            headsign
            code
            route {
              id
              gtfsId
              shortName
              longName
              mode
              color
            }
            stops {
              gtfsId
            }
          }
          stoptimes {
            headsign
            pickupType
          }
        }
        stops {
          gtfsId
          platformCode
          stoptimesForPatterns(numberOfDepartures: 1, timeRange: 604800) {
            pattern {
              headsign
              code
              route {
                id
                gtfsId
                shortName
                longName
                mode
                color
              }
              stops {
                gtfsId
              }
            }
            stoptimes {
              headsign
              pickupType
            }
          }
        }
      }
    `,
  },
);

export {
  withRelayContainer as default,
  StopRoutesAndPlatformsContainer as Component,
};
