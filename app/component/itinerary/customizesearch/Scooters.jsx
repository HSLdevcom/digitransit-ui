import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import NetworkSelector from './NetworkSelector.jsx';
import Disclaimer from '../../Disclaimer.jsx';
import {
  getReadMessageIds,
  setReadMessageId,
} from '../../../data/localStorage.js';
import { TransportMode } from '../../../constants.js';
import { useConfigContext } from '../../../configurations/ConfigContext.jsx';

export default function Scooters({ updateSettings }) {
  const config = useConfigContext();
  const [showEScooterDisclaimer, setShowEScooterDisclaimer] = useState(
    !getReadMessageIds().includes('e_scooter_settings_disclaimer'),
  );

  const handleEScooterDisclaimerClose = () => {
    setReadMessageId('e_scooter_settings_disclaimer');
    setShowEScooterDisclaimer(false);
  };

  return (
    <>
      <div className="section-header">
        <FormattedMessage id="e-scooters" />
      </div>
      {showEScooterDisclaimer && (
        <Disclaimer
          headerId="settings-e-scooter-routes"
          textId="settings-e-scooter"
          values={{
            paymentInfo: <FormattedMessage id="payment-info-e-scooter" />,
          }}
          href={config.vehicleRental.scooterInfoLink?.[config.language].url}
          linkLabelId="read-more"
          closable
          onClose={handleEScooterDisclaimerClose}
        />
      )}
      <NetworkSelector
        type={TransportMode.Scooter}
        updateSettings={updateSettings}
      />
    </>
  );
}

Scooters.propTypes = { updateSettings: PropTypes.func.isRequired };
