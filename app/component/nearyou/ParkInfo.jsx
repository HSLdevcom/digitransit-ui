import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import { useState } from 'react';
import {
  getReadMessageIds,
  setReadMessageId,
} from '../../../utils/client/localStorage';
import { useConfigContext } from '../../hooks/ConfigContext';
import Disclaimer from '../Disclaimer';

export default function ParkInfo({ mode }) {
  const { parkAndRide } = useConfigContext();
  const { locale } = useIntl();
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
        href={parkAndRide?.url?.[locale]}
        closable
        onClose={handleClose}
      />
      <div style={{ height: '22px' }} />
    </>
  );
}

ParkInfo.propTypes = { mode: PropTypes.string.isRequired };
