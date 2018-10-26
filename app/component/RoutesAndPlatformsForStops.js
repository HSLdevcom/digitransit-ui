import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import cx from 'classnames';
import RouteNumberContainer from './RouteNumberContainer';
import RouteDestination from './RouteDestination';
import uniqBy from 'lodash/uniqBy';

const RoutesAndPlatformsForStops = props => {
  console.log(props.stop);
  const mappedRoutes = [];

  props.stop.stoptimesForPatterns.forEach(stopTime =>
    mappedRoutes.push({ ...stopTime.pattern }),
  );
  const filteredRoutes = uniqBy(mappedRoutes, 'code');
  console.log(filteredRoutes);

  const timeTableRows = filteredRoutes.map(route => (
    <p className={cx('departure', 'route-detail-text')} key={route.code}>
      <RouteNumberContainer route={route.route} fadeLong />
      <RouteDestination
        mode={route.mode}
        destination={route.headsign || route.route.longName}
      />
      {/*platformNumber */}
    </p>
  ));

  return <div className="routes-and-platforms-container">{timeTableRows}</div>;
};

RoutesAndPlatformsForStops.propTypes = {
  stop: PropTypes.object.isRequired,
};

export default Relay.createContainer(RoutesAndPlatformsForStops, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        locationType
        platformCode
        stoptimesForPatterns(omitNonPickups: true) {
            pattern {
                code
                headsign
                route {
                    shortName
                    longName
                    mode
                }
                stops {
                    locationType
                    gtfsId
                    code
                    name
                    platformCode  
                }
            }
        }
      }
      `,
  },
});
