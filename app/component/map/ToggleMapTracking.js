import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../Icon';

/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */
function ToggleMapTracking({ handleClick, ariaLabel, color, img }) {
  return (
    <div
      className="toggle-positioning-container"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <Icon
        img={img}
        color={color}
        className="icon-mapMarker-toggle-positioning"
      />
    </div>
  );
}

ToggleMapTracking.propTypes = {
  handleClick: PropTypes.func.isRequired,
  img: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
};

export default ToggleMapTracking;
