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
    <button
      type="button"
      onClick={props.isEnabled ? redirect : undefined}
      className={cx('select-from-map-confirm-button', {
        disabled: !props.isEnabled,
      })}
      style={{
        '--normal-color': `${props.normalColor}`,
        '--hover-color': `${props.hoverColor}`,
      }}
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
  normalColor: PropTypes.string,
  hoverColor: PropTypes.string,
};

ConfirmLocationFromMapButton.defaultProps = {
  normalColor: '#007ac9',
  hoverColor: '#0062a1',
};

export default ConfirmLocationFromMapButton;
