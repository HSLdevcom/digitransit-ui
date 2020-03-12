import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import StopRoutesAndPlatforms from './StopRoutesAndPlatforms';

const TerminalRoutesAndPlatformsContainer = props => {
  return <StopRoutesAndPlatforms stop={props.station} />;
};

TerminalRoutesAndPlatformsContainer.propTypes = {
  station: PropTypes.object.isRequired,
};

const withRelayContainer = createFragmentContainer(
  TerminalRoutesAndPlatformsContainer,
  {
    station: graphql`
      fragment TerminalRoutesAndPlatformsContainer_station on Stop {
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
  TerminalRoutesAndPlatformsContainer as Component,
};
