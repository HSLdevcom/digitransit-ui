import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import { Link } from 'react-router';
import cx from 'classnames';
import IconWithTail from './IconWithTail';
import { PREFIX_ROUTES } from '../util/path';

function TripLink(props) {
  const icon = (
    <IconWithTail
      className={cx(props.mode, 'tail-icon')}
      img={`icon-icon_${props.mode}-live`}
      rotate={180}
    />
  );

  if (props.trip.trip) {
    return (
      <Link
        to={`/${PREFIX_ROUTES}/${props.trip.trip.route.gtfsId}/pysakit/${
          props.trip.trip.pattern.code
        }/${props.trip.trip.gtfsId}`}
        className="route-now-content"
      >
        {icon}
      </Link>
    );
  }

  console.warn('Unable to match trip', props);
  return <span className="route-now-content">{icon}</span>;
}

TripLink.propTypes = {
  trip: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
};

export default createFragmentContainer(TripLink, {
  trip: graphql`
    fragment TripLink_trip on QueryType {
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
  `,
});
