import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/icon-with-tail';
import cx from 'classnames';
import NotImplementedLink from '../util/not-implemented-link';
import { FormattedMessage } from 'react-intl';


function PatternLink(props) {
  const icon = (<IconWithTail
    className={cx(props.routeType, 'large-icon')}
    img={`icon-icon_${props.routeType}-live`}
  />);

  if (props.pattern) {
    return (<Link
      to={props.pattern && `/linjat/${props.pattern}`}
      className="route-now-content"
    >{icon}</Link>);
  }

  return (<NotImplementedLink
    nonTextLink
    className="route-now-content"
    name={<FormattedMessage id="realtime-matching" defaultMessage="Realtime matching" />}
  >{icon}</NotImplementedLink>);
}

PatternLink.propTypes = {
  routeType: React.PropTypes.string.isRequired,
  pattern: React.PropTypes.string.isRequired,
};

export default PatternLink;
