/* eslint-disable react/forbid-prop-types */
import cx from 'classnames';
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
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <div
        className={cx('street-mode-selector-weather-container', `id-${iconId}`)}
      >
        <Icon img={`icon-icon_weather_${iconId}`} height={2.75} width={2.75} />
        <div>
          <div className="street-mode-selector-panel-weather-text">
            {tempLabel}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

StreetModeSelectorWeatherLabel.propTypes = {
  active: PropTypes.bool.isRequired,
  // eslint-disable-next-line react/require-default-props
  weatherData: PropTypes.object,
};

export default StreetModeSelectorWeatherLabel;
