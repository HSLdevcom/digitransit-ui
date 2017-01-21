import React from 'react';
import { Link } from 'react-router';
import IconWithTail from './IconWithTail';
import SelectedIconWithTail from './SelectedIconWithTail';

function PatternLink({ mode, pattern, route, fullscreenMap, selected = false }) {
  const imgName = `icon-icon_${mode}-live`;
  const icon = (selected && (<SelectedIconWithTail img={imgName} fullscreenMap={fullscreenMap} />))
    || (<IconWithTail desaturate img={imgName} rotate={180} />);

  return (<Link
    to={`/linjat/${route}/pysakit/${pattern}`}
    className="route-now-content"
  >{icon}</Link>);
}

PatternLink.propTypes = {
  mode: React.PropTypes.string.isRequired,
  pattern: React.PropTypes.string.isRequired,
  route: React.PropTypes.string.isRequired,
  fullscreenMap: React.PropTypes.bool,
  selected: React.PropTypes.bool,
};

export default PatternLink;
