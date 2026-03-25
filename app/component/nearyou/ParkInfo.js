import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { getReadMessageIds, setReadMessageId } from '../../store/localStorage';
import { useConfigContext } from '../../configurations/ConfigContext';
import Disclaimer from '../Disclaimer';

const ParkInfo = ({ mode }) => {
  const { language, parkAndRide } = useConfigContext();
  const key = `${mode}_info`;
  const prefix = mode === 'CARPARK' ? 'car' : 'bike';
  const [showParkInfo, setShowParkInfo] = useState(
    !getReadMessageIds().includes(key),
  );

  if (!showParkInfo) {
    return null;
  }

  const handleClose = () => {
    setReadMessageId(key);
    setShowParkInfo(false);
  };

  return (
    <>
      <Disclaimer
        headerId={`${prefix}-park-disclaimer-header`}
        textId={`${prefix}-park-disclaimer`}
        linkLabelId="park-disclaimer-link"
        href={parkAndRide?.url?.[language]}
        closable
        onClose={handleClose}
      />
      <div style={{ height: '8px' }} />
    </>
  );
};

ParkInfo.propTypes = { mode: PropTypes.string.isRequired };

export default ParkInfo;
