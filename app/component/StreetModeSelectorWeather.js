/* eslint-disable react/forbid-prop-types */
import cx from 'classnames';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import Icon from './Icon';
import WeatherDetailsPopup from './WeatherDetailsPopup';

export const StreetModeSelectorWeather = ({ weatherData }) => {
  const [popupOpen, changeOpen] = useState(false);
  if (weatherData.temperature) {
    const { temperature, iconId } = weatherData;
    const tempLabel = `${Math.round(temperature)}\u00B0C`; // Temperature with Celsius
    return (
      <>
        <button
          type="button"
          className={cx('street-mode-selector-weather-container')}
          onClick={() => changeOpen(true)}
        >
          <div className="hover-frame">
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

StreetModeSelectorWeather.propTypes = {
  weatherData: PropTypes.oneOfType([
    PropTypes.shape({}),
    PropTypes.shape({
      temperature: PropTypes.number.isRequired,
      windSpeed: PropTypes.number.isRequired,
      iconId: PropTypes.number.isRequired,
    }),
  ]),
};

StreetModeSelectorWeather.defaultProps = {
  weatherData: {},
};

export default StreetModeSelectorWeather;
