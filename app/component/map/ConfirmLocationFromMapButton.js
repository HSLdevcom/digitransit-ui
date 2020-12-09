import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { otpToLocation } from '../../util/otpStrings';

const ConfirmLocationFromMapButton = props => {
  const redirect = () => {
    if (props.address) {
      props.onConfirm(props.type, otpToLocation(props.address));
    }
  };

  return (
    <div className={cx('select-from-map-confirm-button-container')}>
      <button
        type="button"
        onClick={props.isEnabled ? redirect : undefined}
        className={cx('select-from-map-confirm-button', {
          disabled: !props.isEnabled,
        })}
        style={{
          '--color': `${props.color}`,
          '--hover-color': `${props.hoverColor}`,
        }}
        key="confirmLocation"
      >
        {props.title}
      </button>
    </div>
  );
};

ConfirmLocationFromMapButton.propTypes = {
  address: PropTypes.string,
  isEnabled: PropTypes.bool,
  title: PropTypes.string,
  type: PropTypes.string,
  onConfirm: PropTypes.func,
  color: PropTypes.string.isRequired,
  hoverColor: PropTypes.string.isRequired,
};

export default ConfirmLocationFromMapButton;
