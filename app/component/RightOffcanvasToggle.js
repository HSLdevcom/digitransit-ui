import PropTypes from 'prop-types';
import React from 'react';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

export default function RightOffcanvasToggle(
  { onToggleClick, defaultMessage, translationId },
  { intl: { formatMessage }, config },
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
        className="noborder cursor-pointer open-advanced-settings-window-button"
      >
        <div>
          <div className="icon-holder">
            <Icon img="icon-icon_settings" color={config.colors.primary} />
          </div>
          <span className="settings-button-text">
            <FormattedMessage
              id={translationId}
              defaultMessage={defaultMessage}
            />
          </span>
        </div>
      </div>
    </div>
  );
}

RightOffcanvasToggle.propTypes = {
  onToggleClick: PropTypes.func,
  defaultMessage: PropTypes.string,
  translationId: PropTypes.string,
};

RightOffcanvasToggle.defaultProps = {
  defaultMessage: 'Settings',
  translationId: 'settings',
};

RightOffcanvasToggle.contextTypes = {
  intl: intlShape.isRequired,
  config: PropTypes.object,
};

RightOffcanvasToggle.displayName = 'RightOffcanvasToggle';
