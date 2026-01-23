import React, { useState } from 'react';
import { getReadMessageIds, setReadMessageIds } from '../../store/localStorage';
import { useConfigContext } from '../../configurations/ConfigContext';
import {
  getRentalNetworkConfig,
  getRentalNetworkId,
} from '../../util/vehicleRentalUtils';
import Disclaimer from '../Disclaimer';

const CityBikeInfo = () => {
  const config = useConfigContext();
  const { vehicleRental, language } = config;
  const [showCityBikeTeaser, setShowCityBikeTeaser] = useState(
    !getReadMessageIds().includes('citybike_teaser'),
  );

  const handleClose = () => {
    const readMessageIds = getReadMessageIds() || [];
    readMessageIds.push('citybike_teaser');
    setReadMessageIds(readMessageIds);
    setShowCityBikeTeaser(false);
  };
  // Use general information about using city bike, if one network config is available
  const networkConfig =
    Object.keys(vehicleRental.networks).length === 1 &&
    getRentalNetworkConfig(
      getRentalNetworkId(Object.keys(vehicleRental.networks)),
      config,
    );

  const href =
    vehicleRental.buyUrl?.[language] || networkConfig?.url?.[language];

  if (!showCityBikeTeaser || !href) {
    return null;
  }
  const linkLabelId = vehicleRental.buyUrl?.[language]
    ? 'citybike-purchase-link'
    : 'citybike-start-using-info';

  return (
    <>
      <Disclaimer
        headerId="citybike-start-using"
        text={vehicleRental.buyInstructions?.[language]}
        href={href}
        linkLabelId={linkLabelId}
        closable
        onClose={handleClose}
      />
      <div style={{ height: '8px' }} />
    </>
  );
};

export default CityBikeInfo;
