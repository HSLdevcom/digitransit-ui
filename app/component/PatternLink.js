import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import IconWithTail from './IconWithTail';
import SelectedIconWithTail from './SelectedIconWithTail';
import { PREFIX_ROUTES } from '../util/path';

function PatternLink({ mode, pattern, route, selected = false }) {
  const imgName = `icon-icon_${mode}-live`;
  const icon = (selected && <SelectedIconWithTail img={imgName} />) || (
    <IconWithTail desaturate img={imgName} rotate={180} />
  );

  return (
    <Link
      to={`/${PREFIX_ROUTES}/${route}/pysakit/${pattern}`}
      className="route-now-content"
    >
      {icon}
    </Link>
  );
}

PatternLink.propTypes = {
  mode: PropTypes.string.isRequired,
  pattern: PropTypes.string.isRequired,
  route: PropTypes.string.isRequired,
  selected: PropTypes.bool,
};

export default PatternLink;
