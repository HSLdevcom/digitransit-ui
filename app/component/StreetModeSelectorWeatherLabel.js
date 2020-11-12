/* eslint-disable react/forbid-prop-types */
import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import WeatherDetailsPopup from './WeatherDetailsPopup';

export const StreetModeSelectorWeatherLabel = ({ active, weatherData }) => {
  const [popupOpen, changeOpen] = useState(false);
  if (active && weatherData && weatherData.temperature) {
    if (weatherData.temperature === 'NaN') {
      return null;
    }
    const { temperature, iconId } = weatherData;
    const tempLabel = `${Math.round(temperature)}\u00B0C`; // Temperature with Celsius
    return (
      <>
        <button
          type="button"
          className={cx('street-mode-selector-weather-container')}
          onClick={() => changeOpen(true)}
        >
          <span className="sr-only">
            <FormattedMessage id="weather" />
            <FormattedMessage id={`weather-icon-${weatherData.iconId}`} />
            {tempLabel}
          </span>
          <Icon img={`icon-icon_weather_${iconId}`} />
          <div
            className="street-mode-selector-panel-weather-text"
            aria-hidden="true"
          >
            {tempLabel}
          </div>
        </button>
        {popupOpen && (
          <WeatherDetailsPopup
            weatherData={weatherData}
            onClose={() => changeOpen(false)}
          />
        )}
      </>
    );
  }
  return null;
};

StreetModeSelectorWeatherLabel.propTypes = {
  active: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/require-default-props
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    windSpeed: PropTypes.number,
    iconId: PropTypes.number,
  }),
};

export default StreetModeSelectorWeatherLabel;
