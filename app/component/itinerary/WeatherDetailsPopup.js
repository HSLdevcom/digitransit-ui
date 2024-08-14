import PropTypes from 'prop-types';
import React from 'react';
import Modal from '@hsl-fi/modal';
import { FormattedMessage, intlShape } from 'react-intl';
import Icon from '../Icon';

export default function WeatherDetailsPopup(
  { weatherData, onClose },
  { intl },
) {
  // Icons for night time is represented adding a 100 to an id. For example:
  // iconId 1 (clear sky) for a day is 101 for a night. Subtract this so we don't need duplicate translations.
  const weatherIdForDescription = weatherData.iconId % 100;
  return (
    <Modal
      appElement="#app"
      contentLabel=""
      closeButtonLabel={intl.formatMessage({ id: 'close' })}
      isOpen
      onCrossClick={onClose}
      variant="small"
      className="weather-details-modal"
      overlayClassName="weather-modal-overlay"
    >
      <div className="weather-details-content">
        <h3 className="weather-title">
          <FormattedMessage id="weather-detail-title" />
          {weatherData.time}
        </h3>
        <div className="weather-icon-row">
          <Icon img={`icon-icon_weather_${weatherData.iconId}`} />
          <span className="weather-temperature">
            {`${Math.round(weatherData.temperature) > 1 ? '+' : ''}${Math.round(
              weatherData.temperature,
            )}\u00B0C`}
          </span>
        </div>
        <p className="weather-description">
          <FormattedMessage id={`weather-icon-${weatherIdForDescription}`} />
        </p>
        <div className="weather-data-source">
          <FormattedMessage id="weather-data-source" />
        </div>
      </div>
    </Modal>
  );
}

WeatherDetailsPopup.propTypes = {
  weatherData: PropTypes.shape({
    temperature: PropTypes.number,
    iconId: PropTypes.number,
    time: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

WeatherDetailsPopup.contextTypes = {
  intl: intlShape.isRequired,
};
