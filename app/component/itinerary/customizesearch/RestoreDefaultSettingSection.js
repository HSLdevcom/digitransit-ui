/* eslint-disable jsx-a11y/label-has-associated-control */
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import cx from 'classnames';
import { FormattedMessage, intlShape } from 'react-intl';
import { isKeyboardSelectionEvent } from '../../../util/browser';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import {
  getDefaultSettings,
  hasCustomizedSettings,
} from '../../../util/planParamUtil';
import { configShape } from '../../../util/shapes';
import { getCustomizedSettings } from '../../../store/localStorage';
import Icon from '../../Icon';

const RestoreDefaultSettingSection = ({ config }, { executeAction, intl }) => {
  const [showSnackbar, setShowSnackbar] = useState(null);
  const [slideOutRestoreSettingsButton, setSlideOutRestoreSettingsButton] =
    useState(null);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');
  const noChangesRef = React.useRef(null);
  const liveRegionRef = React.useRef(null);
  const userHasCustomizedSettings = hasCustomizedSettings(config);

  useEffect(() => {
    if (userHasCustomizedSettings) {
      setLiveRegionMessage(
        intl.formatMessage({
          id: 'settings-changed-by-you',
          defaultMessage: 'Settings changed',
        }),
      );
    }
    if (
      userHasCustomizedSettings === false &&
      slideOutRestoreSettingsButton !== null
    ) {
      setSlideOutRestoreSettingsButton(true);
      setLiveRegionMessage('');

      const timeoutId = setTimeout(
        () => setSlideOutRestoreSettingsButton(false),
        1000,
      );
      return () => clearTimeout(timeoutId);
    }
    setSlideOutRestoreSettingsButton(false);
    return () => {};
  }, [userHasCustomizedSettings]);

  const restoreDefaultSettings = () => {
    const customizedSettings = getCustomizedSettings(config);
    const defaultSettings = getDefaultSettings(config);
    const restoredSettings = Object.keys(customizedSettings).reduce(
      (acc, setting) => ({
        ...acc,
        [setting]: defaultSettings[setting],
      }),
      {},
    );

    executeAction(saveRoutingSettings, {
      ...restoredSettings,
    });
    setShowSnackbar(true);
    setLiveRegionMessage(
      intl.formatMessage({
        id: 'restore-default-settings-success',
        defaultMessage: 'Settings restored to default.',
      }),
    );
    setTimeout(() => {
      setLiveRegionMessage('');
      setShowSnackbar(false);
    }, 4000);
  };

  const noChangesSRContainer = (
    <span
      className="sr-only"
      tabIndex="-1"
      ref={noChangesRef}
      aria-live="polite"
      role="status"
    >
      <FormattedMessage
        id="restore-default-settings-aria-label-done"
        defaultMessage="Default settings are in use."
      />
    </span>
  );

  return (
    <>
      <div
        className={cx('restore-settings-success-snackbar', {
          hide: showSnackbar === null,
          show: showSnackbar === true,
          'slide-out': showSnackbar === false,
        })}
        aria-hidden="true"
      >
        <Icon img="icon_checkmark-circled" omitViewBox />
        <span className="snackbar-text">
          <FormattedMessage
            id="restore-default-settings-success"
            defaultMessage="Settings restored to default."
          />
        </span>
        <button
          type="button"
          className="close-button"
          aria-label={intl.formatMessage({
            id: 'close',
            defaultMessage: 'Close notification',
          })}
          onClick={() => setShowSnackbar(false)}
        >
          <Icon id="close-icon" img="notification-close" omitViewBox />
        </button>
      </div>
      <div
        className="sr-only"
        aria-live="polite"
        role="status"
        tabIndex="-1"
        ref={liveRegionRef}
      >
        {liveRegionMessage}
      </div>
      {userHasCustomizedSettings || slideOutRestoreSettingsButton ? (
        <div
          className={cx('restore-settings-section', {
            hide:
              userHasCustomizedSettings === false &&
              !slideOutRestoreSettingsButton,
            show: userHasCustomizedSettings === true,
            'slide-out': slideOutRestoreSettingsButton,
          })}
        >
          <Icon img="icon_checkmark" omitViewBox />
          <FormattedMessage
            id="settings-changed-by-you"
            defaultMessage="Settings changed"
          />
          <button
            type="button"
            tabIndex="0"
            onClick={restoreDefaultSettings}
            onKeyPress={e =>
              isKeyboardSelectionEvent(e) && restoreDefaultSettings()
            }
            className="noborder cursor-pointer restore-settings-button"
            aria-label={intl.formatMessage({
              id: 'restore-default-settings-aria-label',
              defaultMessage: 'Restore default settings',
            })}
          >
            <FormattedMessage
              id="restore-default-settings"
              defaultMessage="Restore default settings"
            />
          </button>
        </div>
      ) : (
        noChangesSRContainer
      )}
    </>
  );
};

RestoreDefaultSettingSection.propTypes = {
  config: configShape.isRequired,
};

RestoreDefaultSettingSection.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default RestoreDefaultSettingSection;
