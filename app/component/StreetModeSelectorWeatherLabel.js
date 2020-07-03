/* eslint-disable react/forbid-prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import Icon from './Icon';

export const StreetModeSelectorWeatherLabel = ({ active, weatherData }) => {
  if (active && weatherData) {
    if (weatherData.temperature === 'NaN') {
      return null;
    }
    const { temperature, iconId } = weatherData;
    const tempLabel = `${Math.round(temperature)} \u2103`; // Temperature with Celsius
    // console.log(`icon-icon_weather_${iconId}`);
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div className="street-mode-selector-weather-container">
        <Icon img={`icon-icon_weather_${iconId}`} height={2} width={2} />
        <div>
          <div className="street-mode-selector-panel-weather-text">
            {tempLabel}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="street-mode-selector-button-container">
      <div className="disabled-overlay" />
      <div className="street-mode-selector-button-content">
        <Icon
          img={null}
          className="steet-mode-selector-button-icon"
          height={1.5}
          width={1.5}
        />
        <div className="street-mode-button-info">
          <div className="street-mode-button-time">- min</div>
          <div className="street-mode-button-length">- km</div>
        </div>
      </div>
    </div>
  );
};

StreetModeSelectorWeatherLabel.propTypes = {
  active: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/require-default-props
  weatherData: PropTypes.object,
};

export default StreetModeSelectorWeatherLabel;
