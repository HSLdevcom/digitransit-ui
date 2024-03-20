import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import StopCode from './StopCode';

const AddressRow = props => (
  <div
    className="route-address-row-container"
    ref={el => {
      if (el) {
        /* eslint-disable no-param-reassign */
        el.style.width = null;
        const rounded = Math.ceil(el.offsetWidth + 1);
        el.style.width = `${rounded}px`;
      }
    }}
  >
    <span className="route-stop-address-row">{props.desc}</span>
    {props.code && <StopCode code={props.code} />}
    {props.isTerminal && (
      <p className="card-code terminal">
        <FormattedMessage id="station" />
      </p>
    )}
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
