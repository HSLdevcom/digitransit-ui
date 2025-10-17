import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { intlShape, FormattedMessage } from 'react-intl';
import Icon from './Icon';
import { isKeyboardSelectionEvent } from '../util/browser';

export default function Popover({ onClose, message, buttonText }, { intl }) {
  const [isSettingChangeInfoDismissed, setSettingChangeInfoDismissed] =
    useState(false);

  const closeLabel = intl.formatMessage({
    id: 'close',
    defaultMessage: 'Close',
  });
  return (
    <div
      className={`popover ${isSettingChangeInfoDismissed ? 'fade-away' : ''}`}
      aria-live="polite"
      role="alert"
    >
      <Icon img="icon_checkmark" className="checkmark" />
      <div className="popover-content">
        <div className="popover-message-content">
          {message}
          <button
            type="button"
            tabIndex="0"
            onClick={e => {
              e.stopPropagation();
              setSettingChangeInfoDismissed(true);
              onClose();
            }}
            onKeyDown={e => {
              if (isKeyboardSelectionEvent(e)) {
                e.stopPropagation();
                setSettingChangeInfoDismissed(true);
                onClose();
              }
            }}
            aria-label={closeLabel}
            title={closeLabel}
            className="noborder cursor-pointer popover-close-button"
          >
            <Icon img="icon_close" />
          </button>
        </div>
        <button
          type="button"
          tabIndex="0"
          onClick={e => {
            e.stopPropagation();
            setSettingChangeInfoDismissed(true);
            onClose(true);
          }}
          onKeyDown={e => {
            if (isKeyboardSelectionEvent(e)) {
              e.stopPropagation();
              setSettingChangeInfoDismissed(true);
              onClose(true);
            }
          }}
          className="popover-acknowledge-button"
          aria-label={intl.formatMessage({
            id: 'acknowledged',
            defaultMessage: 'Understood',
          })}
        >
          {buttonText || (
            <FormattedMessage
              id="popover-button-got-it"
              defaultMessage="Got it!"
            />
          )}
        </button>
      </div>
    </div>
  );
}

Popover.propTypes = {
  onClose: PropTypes.func.isRequired,
  message: PropTypes.node.isRequired,
  buttonText: PropTypes.node,
};

Popover.defaultProps = {
  buttonText: null,
};

Popover.contextTypes = {
  intl: intlShape.isRequired,
};

Popover.displayName = 'Popover';
