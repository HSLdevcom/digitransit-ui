import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import NetworkSelector from './NetworkSelector';
import Disclaimer from '../../Disclaimer';
import {
  getReadMessageIds,
  setReadMessageId,
} from '../../../store/localStorage';
import { TransportMode } from '../../../constants';
import { useConfigContext } from '../../../configurations/ConfigContext';

export default function Scooters() {
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
      <NetworkSelector type={TransportMode.Scooter} />
    </>
  );
}
