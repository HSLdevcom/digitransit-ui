import PropTypes from 'prop-types';
import React from 'react';
import { Modal, ModalContent } from '@hsl-fi/dialog';
import { Text, FlexColumn, FlexRow } from '@hsl-fi/layout-primitives';
import { useIntl } from 'react-intl';
import { useConfigContext } from '../../client/ConfigContext';
import Icon from '../Icon';

export default function WeatherDetailsPopup({ weatherData, onClose }) {
  const intl = useIntl();
  const config = useConfigContext();
  // Icons for night time is represented adding a 100 to an id. For example:
  // iconId 1 (clear sky) for a day is 101 for a night. Subtract this so we don't need duplicate translations.
  const weatherIdForDescription = weatherData.iconId % 100;
  const title = (
    <span
      style={{
        display: 'block',
        maxWidth: 250,
        margin: '0 auto',
        textAlign: 'center',
      }}
    >
      {intl.formatMessage({ id: 'weather-detail-title' })}
      {weatherData.time}
    </span>
  );
  return (
    <Modal lang={config.language} open onOpenChange={onClose}>
      <ModalContent
        title={title}
        lang={config.language}
        className="weather-modal-sheet"
      >
        <FlexColumn alignItems="center" gap="m">
          <FlexRow alignItems="center" gap="s">
            <Icon
              img={`icon_weather_${weatherData.iconId}`}
              width={2.5625}
              height={2.5625}
            />
            <Text variant="heading-s" fixedSize="desktop">
              {`${
                Math.round(weatherData.temperature) > 1 ? '+' : ''
              }${Math.round(weatherData.temperature)}\u00B0C`}
            </Text>
          </FlexRow>
          <Text variant="text-s" textAlign="center">
            {intl.formatMessage({
              id: `weather-icon-${weatherIdForDescription}`,
            })}
          </Text>
          <Text variant="text-xs" textAlign="center">
            {intl.formatMessage({ id: 'weather-data-source' })}
          </Text>
        </FlexColumn>
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
