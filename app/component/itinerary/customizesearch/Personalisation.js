import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import SettingsToggle from './SettingsToggle';
import PrModal from './PrModal';
import { saveRoutingSettings } from '../../../action/SearchSettingsActions';
import Icon from '../../Icon';
import { addAnalyticsEvent } from '../../../util/analyticsUtils';
import { settingsShape } from '../../../util/shapes';
import { useTranslationsContext } from '../../../util/useTranslationsContext';

export default function Personalisation(
  { currentSettings },
  { executeAction },
) {
  const intl = useTranslationsContext();
  const [modalOpen, setModalOpen] = useState(false);

  const onToggle = () => {
    addAnalyticsEvent({
      category: 'ItinerarySettings',
      action: `Settings${
        currentSettings.personalisation ? 'Disable' : 'Enable'
      }Personalisation`,
      name: null,
    });
    executeAction(saveRoutingSettings, {
      personalisation: !currentSettings.personalisation,
    });
  };

  const linkText = intl.formatMessage({ id: 'personalisation-open-info' });
  const words = linkText.split(' ');
  const lastWord = words.pop();
  const start = words.join(' ');

  return (
    <>
      <div className="section-header">
        <FormattedMessage id="personalisation" />
      </div>
      <SettingsToggle
        id="settings-toggle-personalisation"
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
        toggled={!!currentSettings.personalisation}
        onToggle={onToggle}
      />
      <div className="toggle-info">
        <FormattedMessage id="personalisation-info" />
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
    </>
  );
}

Personalisation.propTypes = {
  currentSettings: settingsShape.isRequired,
};

Personalisation.contextTypes = {
  executeAction: PropTypes.func.isRequired,
};
