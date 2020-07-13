import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { QueryRenderer, graphql } from 'react-relay';
import Link from 'found/lib/Link';
import cx from 'classnames';
import ReactRelayContext from 'react-relay/lib/ReactRelayContext';
import IconWithTail from './IconWithTail';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';

function FuzzyTripLink({ vehicle }) {
  const relayEnvironment = useContext(ReactRelayContext);

  const icon = (
    <IconWithTail
      className={cx(vehicle.mode, 'tail-icon')}
      img={`icon-icon_${vehicle.mode}-live`}
      rotate={180}
    />
  );

  return (
    <QueryRenderer
      query={graphql`
        query FuzzyTripLinkQuery(
          $route: String!
          $direction: Int!
          $time: Int!
          $date: String!
        ) {
          trip: fuzzyTrip(
            route: $route
            direction: $direction
            time: $time
            date: $date
          ) {
            gtfsId
            pattern {
              code
            }
            route {
              gtfsId
            }
          }
        }
      `}
      variables={{
        route: vehicle.route,
        direction: vehicle.direction,
        date: vehicle.operatingDay,
        time:
          vehicle.tripStartTime.substring(0, 2) * 60 * 60 +
          vehicle.tripStartTime.substring(2, 4) * 60,
      }}
      environment={relayEnvironment}
      render={({ props }) => {
        if (!props) {
          return <span className="route-now-content">{icon}</span>;
        }

        const route = props.trip.route.gtfsId;
        const pattern = props.trip.pattern.code;
        const trip = props.trip.gtfsId;
        return (
          <Link
            to={`/${PREFIX_ROUTES}/${route}/${PREFIX_STOPS}/${pattern}/${trip}`}
            className="route-now-content"
            onClick={() => {
              addAnalyticsEvent({
                category: 'Route',
                action: 'OpenTripInformation',
                name: vehicle.mode.toUpperCase(),
              });
            }}
          >
            {icon}
          </Link>
        );
      }}
    />
  );
}

FuzzyTripLink.propTypes = {
  trip: PropTypes.object,
  vehicle: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    route: PropTypes.string.isRequired,
    direction: PropTypes.number.isRequired,
    tripStartTime: PropTypes.string.isRequired,
    operatingDay: PropTypes.string.isRequired,
  }).isRequired,
};

export default FuzzyTripLink;
