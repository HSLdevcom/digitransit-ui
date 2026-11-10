import PropTypes from 'prop-types';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import NetworkSelector from './NetworkSelector';
import Disclaimer from '../../Disclaimer';
import {
  getReadMessageIds,
  setReadMessageId,
} from '../../../../utils/client/localStorage';
import { TransportMode } from '../../../../utils/shared/constants';
import { useConfigContext } from '../../../hooks/ConfigContext';

export default function Scooters({ updateSettings }) {
  const config = useConfigContext();
  const { locale } = useIntl();
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
          href={config.vehicleRental.scooterInfoLink?.[locale].url}
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
