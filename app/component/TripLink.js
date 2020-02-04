import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { Link } from 'react-router';
import cx from 'classnames';
import IconWithTail from './IconWithTail';
import { PREFIX_ROUTES } from '../util/path';
import { addAnalyticsEvent } from '../util/analyticsUtils';

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

TripLink.propTypes = {
  trip: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
};

const containerComponent = createFragmentContainer(TripLink, {
  trip: graphql`
    fragment TripLink_trip on QueryType
      @argumentDefinitions(id: { type: "String!" }) {
      trip: trip(id: $id) {
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

export { containerComponent as default, TripLink as Component };
