/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';

export default function StreetModeSelectorShimmer({ loading }) {
  return (
    <div
      className={`street-mode-selector-shimmer ${
        loading ? 'street-mode-selector-shimmer-active' : ''
      }`}
    >
      <div className="street-mode-button-row">
        <div className="street-mode-selector-weather-placeholder">
          <div>
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="street-mode-selector-button-placeholder street-mode-selector-button-container" />
        <div className="street-mode-selector-button-placeholder street-mode-selector-button-container" />
        <div className="street-mode-selector-button-placeholder street-mode-selector-button-container" />
      </div>
    </div>
  );
}

StreetModeSelectorShimmer.propTypes = {
  loading: PropTypes.bool,
};

StreetModeSelectorShimmer.defaultProps = {
  loading: false,
};
