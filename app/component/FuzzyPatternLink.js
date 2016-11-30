import React from 'react';
import Relay from 'react-relay';
import { Link } from 'react-router';
import { FormattedMessage } from 'react-intl';
import IconWithTail from './IconWithTail';
import SelectedIconWithTail from './SelectedIconWithTail';
import NotImplementedLink from './NotImplementedLink';

function FuzzyPatternLink(props) {
  const imgName = `icon-icon_${props.mode}-live`;
  const icon = (props.selected && (<SelectedIconWithTail img={imgName} />))
    || (<IconWithTail desaturate img={imgName} rotate={props.reverse ? 0 : 180} />);

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

  return (<NotImplementedLink
    nonTextLink
    className="route-now-content"
    name={<FormattedMessage id="realtime-matching" defaultMessage="Realtime matching" />}
  >{icon}</NotImplementedLink>);
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
