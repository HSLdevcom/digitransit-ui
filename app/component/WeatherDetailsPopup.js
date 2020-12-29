import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import Modal from '@hsl-fi/modal';
import { FormattedMessage, intlShape } from 'react-intl';

import Icon from './Icon';

function WeatherDetailsPopup({ weatherData, onClose }, { intl }) {
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
          {` ${moment(weatherData.time).format('HH:mm')}`}
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
          <FormattedMessage id={`weather-icon-${weatherData.iconId}`} />
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
    time: PropTypes.number,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

WeatherDetailsPopup.contextTypes = {
  intl: intlShape.isRequired,
};

export default WeatherDetailsPopup;
