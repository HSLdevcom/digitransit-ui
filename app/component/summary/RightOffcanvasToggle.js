import React from 'react';
import Icon from '../icon/icon';

export default function RightOffcanvasToggle({ onToggleClick, hasChanges }) {
  return (
    <div
      onClick={onToggleClick}
      className="cursor-pointer right-offcanvas-toggle"
    >
      <div className="icon-holder">
        <Icon img="icon-icon_menu" />
        {hasChanges ? <Icon img="icon-icon_caution" className="super-icon" /> : null}
      </div>
    </div>
  );
}

RightOffcanvasToggle.propTypes = {
  onToggleClick: React.PropTypes.func.isRequired,
  hasChanges: React.PropTypes.bool,
};
