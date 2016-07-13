import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/icon-with-tail';
import cx from 'classnames';

function PatternLink(props) {
  const icon = (<IconWithTail
    className={cx(props.routeType, 'large-icon')}
    img={`icon-icon_${props.routeType}-live`}
  />);

  return (<Link
    to={props.pattern && `/linjat/${props.pattern}`}
    className="route-now-content"
  >{icon}</Link>);
}

PatternLink.propTypes = {
  routeType: React.PropTypes.string.isRequired,
  pattern: React.PropTypes.string.isRequired,
};

export default PatternLink;
