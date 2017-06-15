import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';

function ToggleMapTracking(props) {
  return (
    <div className="toggle-positioning-container" onClick={props.handleClick}>
      <Icon img="icon-icon_position" className={props.className} />
    </div>
  );
}

ToggleMapTracking.propTypes = {
  handleClick: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
};

export default ToggleMapTracking;
