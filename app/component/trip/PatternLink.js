import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/IconWithTail';
import cx from 'classnames';

function PatternLink({ mode, pattern, selected = false }) {
  const icon = (<IconWithTail
    className={cx(mode, 'large-icon', { large: selected })}
    img={`icon-icon_${mode}-live`}
  />);

  return (<Link
    to={pattern && `/linjat/${pattern}`}
    className="route-now-content"
  >{icon}</Link>);
}

PatternLink.propTypes = {
  mode: React.PropTypes.string.isRequired,
  pattern: React.PropTypes.string.isRequired,
  selected: React.PropTypes.bool,
};

export default PatternLink;
