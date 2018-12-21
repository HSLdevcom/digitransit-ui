import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';
import ComponentUsageExample from './ComponentUsageExample';
import { isKeyboardSelectionEvent } from '../util/browser';

export default function RightOffcanvasToggle(
  { onToggleClick, hasChanges },
  { intl: { formatMessage } },
) {
  const label = formatMessage({
    id: 'settings-label-change',
    defaultMessage: 'Change settings',
  });
  return (
    <div className="right-offcanvas-toggle">
      <div
        role="button"
        tabIndex="0"
        onClick={onToggleClick}
        onKeyPress={e => isKeyboardSelectionEvent(e) && onToggleClick()}
        aria-label={label}
        title={label}
        className="noborder cursor-pointer"
      >
        <div>
          <div className="icon-holder">
            {hasChanges ? (
              <Icon img="icon-icon_settings-adjusted" />
            ) : (
              <Icon img="icon-icon_settings" />
            )}
            {hasChanges ? (
              <Icon img="icon-icon_attention" className="super-icon" />
            ) : null}
          </div>
          <FormattedMessage id="settings" defaultMessage="Settings" />
        </div>
      </div>
    </div>
  );
}

RightOffcanvasToggle.propTypes = {
  onToggleClick: PropTypes.func.isRequired,
  hasChanges: PropTypes.bool,
};

RightOffcanvasToggle.defaultProps = {
  hasChanges: false,
};

RightOffcanvasToggle.contextTypes = {
  intl: intlShape.isRequired,
};

RightOffcanvasToggle.displayName = 'RightOffcanvasToggle';

RightOffcanvasToggle.description = () => (
  <div>
    <p>A toggle for the itinerary search preferences.</p>
    <ComponentUsageExample description="Preferences are default preferences">
      <RightOffcanvasToggle onToggleClick={() => {}} />
    </ComponentUsageExample>
    <ComponentUsageExample description="User has modified the preferences">
      <RightOffcanvasToggle onToggleClick={() => {}} hasChanges />
    </ComponentUsageExample>
  </div>
);
