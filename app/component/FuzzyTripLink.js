import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import { Link } from 'react-router';
import cx from 'classnames';
import IconWithTail from './IconWithTail';
import { PREFIX_ROUTES, PREFIX_STOPS } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';

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
        to={`/${PREFIX_ROUTES}/${
          props.trip.trip.route.gtfsId
        }/${PREFIX_STOPS}/${props.trip.trip.pattern.code}/${
          props.trip.trip.gtfsId
        }`}
        className="route-now-content"
        onClick={() => {
          addAnalyticsEvent({
            category: 'Route',
            action: 'OpenTripInformation',
            name: props.mode.toUpperCase(),
          });
        }}
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

const containerComponent = Relay.createContainer(FuzzyTripLink, {
  fragments: {
    trip: () => Relay.QL`
      fragment on QueryType {
        trip: fuzzyTrip(route: $route, direction: $direction, time: $time, date: $date) {
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
  },
  initialVariables: {
    route: null,
    direction: null,
    date: null,
    time: null,
  },
});

export { containerComponent as default, FuzzyTripLink as Component };
