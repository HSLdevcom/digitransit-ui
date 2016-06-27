import React from 'react';
import Icon from '../icon/icon';
import ComponentUsageExample from '../documentation/ComponentUsageExample';

export default function RightOffcanvasToggle({ onToggleClick, hasChanges }) {
  return (
    <div
      onClick={onToggleClick}
      className="cursor-pointer right-offcanvas-toggle"
    >
      <div className="icon-holder">
        <Icon img="icon-icon_ellipsis" />
        {hasChanges ? <Icon img="icon-icon_caution" className="super-icon" /> : null}
      </div>
    </div>
  );
}

RightOffcanvasToggle.propTypes = {
  onToggleClick: React.PropTypes.func.isRequired,
  hasChanges: React.PropTypes.bool,
};

RightOffcanvasToggle.description = (
  <div>
    <p>
      A toggle for the itinerary search preferences.
    </p>
    <ComponentUsageExample description="Preferences are default preferences">
      <RightOffcanvasToggle onToggleClick={() => {}} />
    </ComponentUsageExample>
    <ComponentUsageExample description="User has modified the preferences">
      <RightOffcanvasToggle onToggleClick={() => {}} hasChanges />
    </ComponentUsageExample>
  </div>);
