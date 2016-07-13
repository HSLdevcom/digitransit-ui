import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/icon-with-tail';
import cx from 'classnames';

function PatternLink({ routeType, pattern, selected = false }) {
  const icon = (<IconWithTail
    className={cx(routeType, 'large-icon', { large: selected })}
    img={`icon-icon_${routeType}-live`}
  />);

  return (<Link
    to={pattern && `/linjat/${pattern}`}
    className="route-now-content"
  >{icon}</Link>);
}

PatternLink.propTypes = {
  routeType: React.PropTypes.string.isRequired,
  pattern: React.PropTypes.string.isRequired,
  selected: React.PropTypes.bool,
};

export default PatternLink;
