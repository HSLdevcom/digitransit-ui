import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import WeatherStationContent from '../../WeatherStationContent';
import ComponentUsageExample from '../../ComponentUsageExample';

function WeatherStationPopup({ station, lang }, { intl }) {
  const localName = station.names[lang] || station.name;

  return (
    <div className="card">
      <Card className="padding-small">
        <CardHeader
          name={intl.formatMessage({
            id: 'road-weather',
            defaultMessage: 'Road weather',
          })}
          description={localName}
          icon="icon-icon_weather-station"
          unlinked
        />
        <WeatherStationContent
          sensors={station.sensorValues}
          measuredTime={station.measuredTime}
          lang={lang}
        />
      </Card>
    </div>
  );
}

WeatherStationPopup.displayName = 'WeatherStationPopup';

WeatherStationPopup.description = (
  <div>
    <p>Renders a weather station popup.</p>
    <ComponentUsageExample description="">
      <WeatherStationPopup context="context object here" />
    </ComponentUsageExample>
  </div>
);

WeatherStationPopup.propTypes = {
  lang: PropTypes.string.isRequired,
  station: PropTypes.object.isRequired,
};

WeatherStationPopup.contextTypes = {
  intl: intlShape.isRequired,
};

export default WeatherStationPopup;
