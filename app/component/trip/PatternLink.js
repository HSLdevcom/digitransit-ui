import React from 'react';
import Link from 'react-router/lib/Link';
import IconWithTail from '../icon/IconWithTail';
import SelectedIconWithTail from '../icon/SelectedIconWithTail';

function PatternLink({ mode, pattern, route, reverse = false, selected = false }) {
  const imgName = `icon-icon_${mode}-live`;
  const icon = (selected && (<SelectedIconWithTail img={imgName} />))
    || (<IconWithTail desaturate img={imgName} rotate={reverse ? 0 : 180} />);

  return (<Link
    to={`/linjat/${route}/pysakit/${pattern}`}
    className="route-now-content"
  >{icon}</Link>);
}

PatternLink.propTypes = {
  mode: React.PropTypes.string.isRequired,
  pattern: React.PropTypes.string.isRequired,
  route: React.PropTypes.string.isRequired,
  reverse: React.PropTypes.bool,
  selected: React.PropTypes.bool,
};

export default PatternLink;
