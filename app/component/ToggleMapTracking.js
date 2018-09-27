import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function ToggleMapTracking(props) {
  return (
    <div
      className="toggle-positioning-container"
      onClick={props.handleClick}
      role="button"
      tabIndex={0}
    >
      <Icon img="icon-icon_position" className={props.className} />
    </div>
  );
}

ToggleMapTracking.propTypes = {
  handleClick: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
};

export default ToggleMapTracking;
