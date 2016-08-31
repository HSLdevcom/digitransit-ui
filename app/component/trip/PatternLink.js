import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/IconWithTail';
import SelectedIconWithTail from '../icon/SelectedIconWithTail';

function PatternLink({ mode, pattern, route, selected = false }) {
  const imgName = `icon-icon_${mode}-live`;
  const icon = (selected && (<SelectedIconWithTail img={imgName} />))
    || (<IconWithTail desaturate img={imgName} />);

  return (<Link
    to={`/linjat/${route}/pysakit/${pattern}`}
    className="route-now-content"
  >{icon}</Link>);
}

PatternLink.propTypes = {
  mode: React.PropTypes.string.isRequired,
  pattern: React.PropTypes.string.isRequired,
  route: React.PropTypes.string.isRequired,
  selected: React.PropTypes.bool,
};

export default PatternLink;
