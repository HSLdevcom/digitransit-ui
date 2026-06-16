import PropTypes from 'prop-types';
import React, { useState, useCallback, useRef } from 'react';
import cx from 'classnames';
import { FormattedMessage, useIntl } from 'react-intl';
import Icon from '../Icon';
import { isKeyboardSelectionEvent } from '../../util/browser';
import { hasCustomizedSettings, getSettings } from '../../util/planParamUtil';
import { isPersonalizationEnabled } from '../../util/modeUtils';
import Popover from '../Popover';
import { getDialogState, setDialogState } from '../../store/localStorage';
import { useConfigContext } from '../../configurations/ConfigContext';

export default function SettingsButton({ onToggleClick }) {
  const { formatMessage } = useIntl();
  const config = useConfigContext();
  const settings = getSettings(config);
  const userHasCustomizedSettings = hasCustomizedSettings(config);
  const [isSettingChangeInfoDismissed, setSettingChangeInfoDismissed] =
    useState(getDialogState('setting-change-acknowledged', config));
  const [isPersonalizationInfoDismissed, setPersonalizationInfoDismissed] =
    useState(getDialogState('personalization-acknowledged', config));
  const buttonRef = useRef(null);

  const label = userHasCustomizedSettings
    ? formatMessage({
        id: 'settings-changed-by-you',
        defaultMessage: 'Settings changed',
      })
    : formatMessage({
        id: 'settings-label-change',
        defaultMessage: 'Change settings',
      });

  const dismissTarget = isPersonalizationInfoDismissed
    ? 'setting-change-acknowledged'
    : 'personalization-acknowledged';
  const dismissPopover = useCallback(() => {
    // wait 1 second before dismissing to allow user to see the popover disappearing
    const timeoutId = setTimeout(() => {
      setDialogState(dismissTarget);
      if (dismissTarget === 'setting-change-acknowledged') {
        setSettingChangeInfoDismissed(true);
      } else {
        setPersonalizationInfoDismissed(true);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, []);

  let personalizationPopover;
  const personalizationEnabled = isPersonalizationEnabled(config, settings);
  if (
    !getDialogState('personalization-acknowledged', config) &&
    config.personalization
  ) {
    personalizationPopover = personalizationEnabled ? (
      <div>
        <div className="popover-header">
          <FormattedMessage id="personalization-new-header" />
        </div>
        <FormattedMessage id="personalization-new-feature" />
      </div>
    ) : (
      <FormattedMessage id="personalization-new-feature" />
    );
  }

  return (
    <div className="right-offcanvas-toggle">
      {personalizationPopover && (
        <Popover
          targetRef={buttonRef}
          onClose={dismissPopover}
          message={personalizationPopover}
          highlight
        />
      )}
      {userHasCustomizedSettings &&
        !isSettingChangeInfoDismissed &&
        isPersonalizationInfoDismissed && (
          <Popover
            targetRef={buttonRef}
            icon={<Icon img="icon_checkmark" className="checkmark" />}
            onClose={dismissPopover}
            message={
              <FormattedMessage
                id="settings-changed-by-you"
                defaultMessage="Settings changed"
              />
            }
          />
        )}
      <div
        ref={buttonRef}
        role="button"
        tabIndex="0"
        onClick={onToggleClick}
        onKeyPress={e => isKeyboardSelectionEvent(e) && onToggleClick()}
        aria-label={label}
        title={label}
        className={cx(
          'noborder',
          'cursor-pointer',
          'open-advanced-settings-window-button',
          {
            'highlight-z-index': personalizationPopover,
          },
        )}
      >
        <div className="icon-holder">
          <Icon img="icon_settings" />
          {userHasCustomizedSettings && (
            <span className="customized-settings-indicator">
              <Icon img="icon_checkmark" />
            </span>
          )}
        </div>
        <span className="settings-button-text">
          <FormattedMessage id="settings" />
        </span>
      </div>
    </div>
  );
}

SettingsButton.propTypes = { onToggleClick: PropTypes.func.isRequired };
