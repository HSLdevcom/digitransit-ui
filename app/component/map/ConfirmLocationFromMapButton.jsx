import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { DomEvent } from 'leaflet';
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

  // This button is rendered as a plain DOM node inside Leaflet's map
  // container, not as a proper Leaflet control, so its clicks/touches
  // aren't guarded from bubbling up to the map's own container-level
  // event listeners the way L.Control's are. Without this, tapping the
  // button also fires the map's click handling underneath it, which can
  // hit-test a station/terminal icon rendered under the button and
  // navigate to the terminal page instead of confirming the selection.
  const setButtonRef = useCallback(node => {
    if (node) {
      DomEvent.disableClickPropagation(node);
    }
  }, []);

  return (
    <div className={cx('select-from-map-confirm-button-container')}>
      <button
        type="button"
        ref={setButtonRef}
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
