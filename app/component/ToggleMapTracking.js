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
  handleClick: React.PropTypes.func.isRequired,
  className: React.PropTypes.string.isRequired,
};

export default ToggleMapTracking;
