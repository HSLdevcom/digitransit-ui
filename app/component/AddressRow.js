import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import StopCode from './StopCode';

const AddressRow = props => (
  <div className="route-address-row-container">
    <span className="route-stop-address-row">{props.desc}</span>
    {props.code && <StopCode code={props.code} />}
    {props.isTerminal && <StopCode code={<FormattedMessage id="station" />} />}
  </div>
);

AddressRow.propTypes = {
  desc: PropTypes.string,
  code: PropTypes.string,
  isTerminal: PropTypes.bool,
};

AddressRow.defaultProps = {
  desc: undefined,
  code: undefined,
  isTerminal: false,
};

export default AddressRow;
