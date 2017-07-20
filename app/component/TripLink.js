import PropTypes from 'prop-types';
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { Link } from 'react-router';
import cx from 'classnames';
import IconWithTail from './IconWithTail';

export default function TripLink({ vehicle }) {
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
        query TripLinkQuery(
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
      environment={Store}
      render={({ props }) => {
        if (!props) {
          return (
            <span className="route-now-content">
              {icon}
            </span>
          );
        }

        const route = props.trip.route.gtfsId;
        const pattern = props.trip.pattern.code;
        const trip = props.trip.gtfsId;
        return (
          <Link
            to={`/linjat/${route}/pysakit/${pattern}/${trip}`}
            className="route-now-content"
          >
            {icon}
          </Link>
        );
      }}
    />
  );
}

TripLink.propTypes = {
  vehicle: PropTypes.shape({
    mode: PropTypes.string.isRequired,
    route: PropTypes.string.isRequired,
    direction: PropTypes.number.isRequired,
    time: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
  }).isRequired,
};
