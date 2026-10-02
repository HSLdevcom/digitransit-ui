import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { otpToLocation } from '../../../utils/shared/otpStrings';

const ConfirmLocationFromMapButton = ({
  address,
  isEnabled = false,
  title,
  type,
  onConfirm,
  color,
  hoverColor,
}) => {
  const redirect = () => {
    if (address) {
      onConfirm(type, otpToLocation(address));
    }
  };

  return (
    <div className={cx('select-from-map-confirm-button-container')}>
      <button
        type="button"
        disabled={!isEnabled}
        onClick={isEnabled ? redirect : undefined}
        className={cx('select-from-map-confirm-button', {
          disabled: !isEnabled,
        })}
        style={{
          '--color': `${color}`,
          '--hover-color': `${hoverColor}`,
        }}
        key="confirmLocation"
      >
        {title}
      </button>
    </div>
  );
};

ConfirmLocationFromMapButton.propTypes = {
  address: PropTypes.string,
  isEnabled: PropTypes.bool,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
};

export default ConfirmLocationFromMapButton;
