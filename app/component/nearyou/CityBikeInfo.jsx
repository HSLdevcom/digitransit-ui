import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  getReadMessageIds,
  setReadMessageId,
} from '../../../utils/client/localStorage';
import { useConfigContext } from '../../hooks/ConfigContext';
import {
  getRentalNetworkConfig,
  getRentalNetworkId,
} from '../../../utils/shared/vehicleRentalUtils';
import Disclaimer from '../Disclaimer';

export default function CityBikeInfo() {
  const config = useConfigContext();
  const { vehicleRental } = config;
  const { locale } = useIntl();
  const [showCityBikeTeaser, setShowCityBikeTeaser] = useState(
    !getReadMessageIds().includes('citybike_teaser'),
  );

  const handleClose = () => {
    setReadMessageId('citybike_teaser');
    setShowCityBikeTeaser(false);
  };
  // Use general information about using city bike, if one network config is available
  const networkConfig =
    Object.keys(vehicleRental.networks).length === 1 &&
    getRentalNetworkConfig(
      getRentalNetworkId(Object.keys(vehicleRental.networks)),
      config,
    );

  const href = vehicleRental.buyUrl?.[locale] || networkConfig?.url?.[locale];

  if (!showCityBikeTeaser || !href) {
    return null;
  }
  const linkLabelId = vehicleRental.buyUrl?.[locale]
    ? 'citybike-purchase-link'
    : 'citybike-start-using-info';

  return (
    <>
      <Disclaimer
        headerId="citybike-start-using"
        text={vehicleRental.buyInstructions?.[locale]}
        href={href}
        linkLabelId={linkLabelId}
        closable
        onClose={handleClose}
      />
      <div style={{ height: '22px' }} />
    </>
  );
}
