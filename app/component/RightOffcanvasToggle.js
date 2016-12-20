import React from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

export default function RightOffcanvasToggle({ onToggleClick, hasChanges }) {
  return (
    <div
      onClick={onToggleClick}
      className="cursor-pointer right-offcanvas-toggle"
    >
      <div className="icon-holder">
        {hasChanges ?
          <Icon img="icon-icon_settings-adjusted" /> : <Icon img="icon-icon_settings" />}
        {hasChanges ? <Icon img="icon-icon_attention" className="super-icon" /> : null}
      </div><span><FormattedMessage id="settings" defaultMessage="Settings" /></span>
    </div>
  );
}

RightOffcanvasToggle.propTypes = {
  onToggleClick: React.PropTypes.func.isRequired,
  hasChanges: React.PropTypes.bool,
  text: React.PropTypes.string,
};

RightOffcanvasToggle.displayName = 'RightOffcanvasToggle';

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
