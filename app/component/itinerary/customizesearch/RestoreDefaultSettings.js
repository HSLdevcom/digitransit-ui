import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { FormattedMessage } from 'react-intl';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import {
  getDefaultSettings,
  hasCustomizedSettings,
} from '../../../util/planParamUtil';
import { getCustomizedSettings } from '../../../store/localStorage';
import Icon from '../../Icon';
import Snackbar from '../../Snackbar';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { useTranslationsContext } from '../../../util/useTranslationsContext';

// eslint-disable-next-line
const RestoreDefaultSettings = ({}, { executeAction }) => {
  const config = useConfigContext();
  const intl = useTranslationsContext();
  const [showSnackbar, setShowSnackbar] = useState(null);
  const [slideOutRestoreSettingsButton, setSlideOutRestoreSettingsButton] =
    useState(null);
  const [snackbarLiveRegionMessage, setSnackBarLiveRegionMessage] =
    useState('');
  const [restoreButtonLiveRegionMessage, setRestoreButtonLiveRegionMessage] =
    useState('');
  const hasBeenShownButtonRef = useRef(false);
  const userHasCustomizedSettings = hasCustomizedSettings(config);
  const snackbarTimeout = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(snackbarTimeout.current);
    };
  }, []);

  useEffect(() => {
    if (userHasCustomizedSettings) {
      hasBeenShownButtonRef.current = true;
      setRestoreButtonLiveRegionMessage(
        intl.formatMessage({
          id: 'settings-changed-by-you',
          defaultMessage: 'Settings changed',
        }),
      );
      const liveRegionTimeoutId = setTimeout(
        () => setRestoreButtonLiveRegionMessage(''),
        1000,
      );
      return () => clearTimeout(liveRegionTimeoutId);
    }
    if (userHasCustomizedSettings === false && hasBeenShownButtonRef.current) {
      setSlideOutRestoreSettingsButton(true);
      const timeoutId = setTimeout(() => {
        setSlideOutRestoreSettingsButton(false);
      }, 1000);
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
    setSnackBarLiveRegionMessage(
      intl.formatMessage({
        id: 'restore-default-settings-success',
        defaultMessage: 'Settings restored to default.',
      }),
    );
    snackbarTimeout.current = setTimeout(() => {
      setSnackBarLiveRegionMessage('');
      setShowSnackbar(false);
    }, 4000);
  };

  const handleSnackbarClose = () => {
    clearTimeout(snackbarTimeout.current);
    setSnackBarLiveRegionMessage('');
    setShowSnackbar(false);
  };

  const noChangesSRContainer = (
    <span className="sr-only" aria-live="polite" role="status">
      <FormattedMessage
        id="restore-default-settings-aria-label-done"
        defaultMessage="Default settings are in use."
      />
    </span>
  );

  return (
    <div className="restore-settings-container">
      <Snackbar
        show={showSnackbar}
        messageId="restore-default-settings-success"
        defaultMessage="Settings restored to default."
        liveRegionMessage={snackbarLiveRegionMessage}
        onClose={handleSnackbarClose}
      />
      <div className="sr-only" aria-live="polite" role="status">
        {restoreButtonLiveRegionMessage}
      </div>
      {userHasCustomizedSettings || slideOutRestoreSettingsButton ? (
        <div
          className={cx('restore-settings', {
            hide:
              userHasCustomizedSettings === false &&
              !slideOutRestoreSettingsButton,
            show: userHasCustomizedSettings === true,
            'slide-out': slideOutRestoreSettingsButton,
          })}
        >
          <Icon img="icon_checkmark" />
          <FormattedMessage
            id="settings-changed-by-you"
            defaultMessage="Settings changed"
          />
          <button
            type="button"
            onClick={restoreDefaultSettings}
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
    </div>
  );
};

RestoreDefaultSettings.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};

export default RestoreDefaultSettings;
