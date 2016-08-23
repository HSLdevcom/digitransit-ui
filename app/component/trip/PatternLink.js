import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/IconWithTail';
import SelectedIconWithTail from '../icon/SelectedIconWithTail';
import cx from 'classnames';

function PatternLink({ mode, pattern, selected = false }) {
  const imgName = `icon-icon_${mode}-live`;
  const icon = (selected && (<SelectedIconWithTail img={imgName} />))
    || (<IconWithTail className={cx(mode, 'tail-icon')} img={imgName} />);

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
