import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import cx from 'classnames';
import IconWithTail from './IconWithTail';

function TripLink(props) {
  const icon = (<IconWithTail
    className={cx(props.mode, 'tail-icon')}
    img={`icon-icon_${props.mode}-live`}
    rotate={180}
  />);

  if (props.trip.trip) {
    return (<Link
      to={
        `/linjat/${props.trip.trip.route.gtfsId}/pysakit/${
          props.trip.trip.pattern.code}/${props.trip.trip.gtfsId}`
      }
      className="route-now-content"
    >{icon}</Link>);
  }

  console.warn('Unable to match trip', props);
  return <span className="route-now-content">{icon}</span>;
}

TripLink.propTypes = {
  trip: React.PropTypes.object.isRequired,
  mode: React.PropTypes.string.isRequired,
};

export default Relay.createContainer(TripLink, {
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
