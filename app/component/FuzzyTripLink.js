import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { Link } from 'react-router';
import cx from 'classnames';
import IconWithTail from './IconWithTail';
import { PREFIX_ROUTES } from '../util/path';

function FuzzyTripLink(props) {
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
  // eslint-disable-next-line no-console
  console.warn('Unable to match trip', props);
  return <span className="route-now-content">{icon}</span>;
}

FuzzyTripLink.propTypes = {
  trip: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
};

const containerComponent = createFragmentContainer(FuzzyTripLink, {
  trip: graphql`
    fragment FuzzyTripLink_trip on QueryType
      @argumentDefinitions(
        route: { type: "String!" }
        direction: { type: "Int!" }
        date: { type: "String!" }
        time: { type: "Int!" }
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
  `,
});

export { containerComponent as default, FuzzyTripLink as Component };
