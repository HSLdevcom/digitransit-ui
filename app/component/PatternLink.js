import PropTypes from 'prop-types';
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
  mode: PropTypes.string.isRequired,
  pattern: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  fullscreenMap: PropTypes.bool,
  selected: PropTypes.bool,
};

export default PatternLink;
