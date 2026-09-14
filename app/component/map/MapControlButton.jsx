import PropTypes from 'prop-types';
import React from 'react';
import Icon from '../Icon';
import { isKeyboardSelectionEvent } from '../../util/browser';

export default function MapControlButton({
  handleClick,
  ariaLabel,
  color,
  img,
}) {
  return (
    <div
      className="map-control-button"
      onClick={handleClick}
      onKeyDown={e => isKeyboardSelectionEvent(e) && handleClick()}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
    >
      <Icon img={img} color={color} />
    </div>
  );
}

MapControlButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  img: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  ariaLabel: PropTypes.string.isRequired,
};
