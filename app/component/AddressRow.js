import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import StopCode from './StopCode';
import { getTerminalOrStationText } from '../util/modeUtils';

export default function AddressRow({
  desc,
  code,
  isTerminal = false,
  vehicleMode,
}) {
  const intl = useIntl();
  return (
    <div className="route-address-row-container">
      <span className="route-stop-address-row">{desc}</span>
      {code && <StopCode code={code} />}
      {isTerminal && (
        <StopCode code={getTerminalOrStationText(intl, vehicleMode)} />
      )}
    </div>
  );
}

AddressRow.propTypes = {
  desc: PropTypes.string,
  code: PropTypes.string,
  isTerminal: PropTypes.bool,
  vehicleMode: PropTypes.string,
};
