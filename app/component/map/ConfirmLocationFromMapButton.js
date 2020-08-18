import React from 'react';
import PropTypes from 'prop-types';
import { otpToLocation } from '../../util/otpStrings';

const ConfirmLocationFromMapButton = props => {
  const redirect = () => {
    if (props.address) {
      props.onConfirm(props.type, otpToLocation(props.address));
    }
  };

  return (
    <button
      type="button"
      onClick={props.isEnabled ? redirect : undefined}
      className={
        props.isEnabled
          ? 'select-from-map-confirm-button-enabled'
          : 'select-from-map-confirm-button-disabled'
      }
      key="confirmLocation"
    >
      {props.title}
    </button>
  );
};

ConfirmLocationFromMapButton.propTypes = {
  address: PropTypes.string,
  isEnabled: PropTypes.bool,
  title: PropTypes.string,
  type: PropTypes.string,
  onConfirm: PropTypes.func,
};

export default ConfirmLocationFromMapButton;
