import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import PrModal from './PrModal';
import PersonalizeAgainModal from './PersonalizeAgainModal';
import Snackbar from '../../Snackbar';
import LoginPrompt from '../../LoginPrompt';
import Icon from '../../Icon';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { isPersonalizationEnabled } from '../../../util/modeUtils';
import { settingsShape } from '../../../util/shapes';
import { useConfigContext } from '../../../configurations/ConfigContext';
import { getPersonalization } from '../../../store/localStorage';

export default function Personalization({ settings, updateSettings }) {
  const intl = useIntl();
  const config = useConfigContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [loginPromptOpen, setLoginPromptOpen] = useState(false);
  const [againModalOpen, setAgainModalOpen] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(null);
  const [snackbarLiveRegionMessage, setSnackBarLiveRegionMessage] =
    useState('');
  const snackbarTimeout = useRef(null);
  const settingsToggleRef = useRef(null);
  const wasAnyModalOpenRef = useRef(null);
  const personalization = isPersonalizationEnabled(config, settings);

  useEffect(() => {
    return () => {
      clearTimeout(snackbarTimeout.current);
    };
  }, []);

  useEffect(() => {
    const anyModalOpen = modalOpen || loginPromptOpen || againModalOpen;
    if (wasAnyModalOpenRef.current && !anyModalOpen) {
      requestAnimationFrame(() => {
        settingsToggleRef.current?.focus?.();
      });
    }
    wasAnyModalOpenRef.current = anyModalOpen;
  }, [modalOpen, loginPromptOpen, againModalOpen]);

  const changePersonalization = newState => {
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${newState ? 'Enable' : 'Disable'}Personalization`,
      name: null,
    });
    updateSettings({ personalization: newState });
    if (newState) {
      setShowSnackbar(true);
      setSnackBarLiveRegionMessage(
        intl.formatMessage({ id: 'personalization-activated' }),
      );
      snackbarTimeout.current = setTimeout(() => {
        setSnackBarLiveRegionMessage('');
        setShowSnackbar(false);
      }, 4000);
    }
  };

  const onToggle = () => {
    const loginNeeded = config.allowLogin && !config.user.sub;
    if (loginNeeded) {
      setLoginPromptOpen(true);
    } else {
      const newState = !personalization;
      if (newState && Object.keys(getPersonalization().weights || []).length) {
        setAgainModalOpen(true);
      } else {
        changePersonalization(newState);
      }
    }
  };

  const handleSnackbarClose = () => {
    clearTimeout(snackbarTimeout.current);
    setSnackBarLiveRegionMessage('');
    setShowSnackbar(false);
  };

  // prevent line wrapping to one short word only
  const linkText = intl.formatMessage({ id: 'personalization-open-info' });
  const words = linkText.split(' ');
  const lastWord = words.pop();
  const start = words.join(' ');

  return (
    <>
      <Snackbar
        show={showSnackbar}
        messageId="personalization-activated"
        liveRegionMessage={snackbarLiveRegionMessage}
        onClose={handleSnackbarClose}
      />
      <div className="section-header">
        <FormattedMessage id="personalization" />
      </div>
      <SettingsToggle
        ref={settingsToggleRef}
        id="settings-toggle-personalization"
        labelId="personal-itineraries"
        labelStyle="mode-label-upper"
        leftElement={
          <Icon
            img="icon_star-with-circle"
            className="selected-fav"
            height={2}
            width={2}
          />
        }
        toggled={personalization}
        onToggle={onToggle}
      />
      <div className="toggle-info">
        <FormattedMessage id="personalization-info" />
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            setModalOpen(true);
          }}
        >
          <span className="nobreaks">
            <span className="breakable">{start} </span>
            <span>
              {lastWord}
              <Icon className="arrow" img="icon_arrow-collapse--right" />
            </span>
          </span>
        </button>
      </div>
      {modalOpen && <PrModal closeModal={() => setModalOpen(false)} />}
      <LoginPrompt
        open={loginPromptOpen}
        onClose={() => setLoginPromptOpen(false)}
        titleId="personalization-login-title"
        descriptionId="personalization-login-description"
      />
      <PersonalizeAgainModal
        open={againModalOpen}
        onClose={() => setAgainModalOpen(false)}
        onContinue={() => {
          setAgainModalOpen(false);
          changePersonalization(true);
        }}
      />
    </>
  );
}

Personalization.propTypes = {
  settings: settingsShape.isRequired,
  updateSettings: PropTypes.func.isRequired,
};
