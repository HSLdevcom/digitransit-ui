import PropTypes from 'prop-types';
import React from 'react';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { useIntl } from 'react-intl';
import { useConfigContext } from '../../client/ConfigContext';
import Icon from '../Icon';

export default function WeatherDetailsPopup({ weatherData, onClose }) {
  const intl = useIntl();
  const config = useConfigContext();
  // Icons for night time is represented adding a 100 to an id. For example:
  // iconId 1 (clear sky) for a day is 101 for a night. Subtract this so we don't need duplicate translations.
  const weatherIdForDescription = weatherData.iconId % 100;
  const title = `${intl.formatMessage({
    id: 'weather-detail-title',
  })}${weatherData.time}`;
  return (
    <Modal lang={config.language} open onOpenChange={onClose}>
      <ModalContent title={title} lang={config.language}>
        <div className="weather-details-content">
          <div className="weather-icon-row">
            <Icon img={`icon_weather_${weatherData.iconId}`} />
            <span className="weather-temperature">
              {`${
                Math.round(weatherData.temperature) > 1 ? '+' : ''
              }${Math.round(weatherData.temperature)}\u00B0C`}
            </span>
          </div>
          <p className="weather-description">
            {intl.formatMessage({
              id: `weather-icon-${weatherIdForDescription}`,
            })}
          </p>
          <div className="weather-data-source">
            {intl.formatMessage({ id: 'weather-data-source' })}
          </div>
        </div>
      </ModalContent>
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
