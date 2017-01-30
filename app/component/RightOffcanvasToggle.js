import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';

export default function RightOffcanvasToggle({ onToggleClick, hasChanges },
  { intl: { formatMessage } }) {
  const label = formatMessage({ id: 'settings-label-change', defaultMessage: 'Change settings' });
  return (
    <div className="right-offcanvas-toggle">
      <button
        onClick={onToggleClick}
        aria-label={label}
        title={label}
        className="noborder cursor-pointer"
      >
        <div>
          <div className="icon-holder">
            {hasChanges ?
              <Icon img="icon-icon_settings-adjusted" /> : <Icon img="icon-icon_settings" />}
            {hasChanges ? <Icon img="icon-icon_attention" className="super-icon" /> : null}
          </div>
          <div>
            <FormattedMessage id="settings" defaultMessage="Settings" />
          </div>
        </div>
      </button>
    </div>
  );
}

RightOffcanvasToggle.propTypes = {
  onToggleClick: React.PropTypes.func.isRequired,
  hasChanges: React.PropTypes.bool,
};

RightOffcanvasToggle.contextTypes = {
  intl: intlShape.isRequired,
};

RightOffcanvasToggle.displayName = 'RightOffcanvasToggle';

RightOffcanvasToggle.description = () =>
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
  </div>;
