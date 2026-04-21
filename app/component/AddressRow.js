import React from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';
import StopCode from './StopCode';
import { getTerminalOrStationText } from '../util/modeUtils';

const AddressRow = props => {
  const intl = useIntl();
  return (
    <div className="route-address-row-container">
      <span className="route-stop-address-row">{props.desc}</span>
      {props.code && <StopCode code={props.code} />}
      {props.isTerminal && (
        <StopCode code={getTerminalOrStationText(intl, props.vehicleMode)} />
      )}
    </div>
  );
};

AddressRow.propTypes = {
  desc: PropTypes.string,
  code: PropTypes.string,
  isTerminal: PropTypes.bool,
  vehicleMode: PropTypes.string,
};

AddressRow.defaultProps = {
  desc: undefined,
  code: undefined,
  isTerminal: false,
  vehicleMode: undefined,
};

export default AddressRow;
