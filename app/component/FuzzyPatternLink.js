import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import IconWithTail from './IconWithTail';
import SelectedIconWithTail from './SelectedIconWithTail';

function FuzzyPatternLink(props) {
  const imgName = `icon-icon_${props.mode}-live`;
  const icon = (props.selected && (<SelectedIconWithTail img={imgName} />))
    || (<IconWithTail className={`${props.reverse ? 'icon-with-tail-reverse' : ''}`} desaturate img={imgName} rotate={props.reverse ? 0 : 180} />);

  if (props.trip.trip) {
    return (
      <Link
        to={`/linjat/${props.trip.trip.route.gtfsId}/pysakit/${props.trip.trip.pattern.code}`}
        className="route-now-content"
      >
        {icon}
      </Link>
    );
  }

  console.warn('Unable to match trip', props);
  return icon;
}

FuzzyPatternLink.propTypes = {
  trip: React.PropTypes.object.isRequired,
  mode: React.PropTypes.string.isRequired,
  reverse: React.PropTypes.bool,
  selected: React.PropTypes.bool,
};

export default Relay.createContainer(FuzzyPatternLink, {
  fragments: {
    trip: () => Relay.QL`
      fragment on QueryType {
        trip: fuzzyTrip(route: $route, direction: $direction, time: $time, date: $date) {
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
