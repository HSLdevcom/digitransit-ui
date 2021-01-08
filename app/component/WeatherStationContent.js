import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import moment from 'moment';
import ComponentUsageExample from './ComponentUsageExample';
import { lang as exampleLang } from './ExampleData';

const makeValue = number => {
  return {
    sensorValue: number,
    sensorUnit: '°C',
  };
};

const WeatherStationContent = ({ airTemperatureC, roadTemperatureC }) => {
  const lang = 'en';
  const sensors = [];
  const measuredTime = 0;
  const airTemperatureSensor = makeValue(airTemperatureC);
  const roadTemperatureSensor = makeValue(roadTemperatureC);
  const rainSensor = sensors.find(item => item.name === 'SADE');
  const weatherSensor = sensors.find(item => item.name === 'KELI_1');
  return (
    <table className="component-list">
      <tbody>
        {airTemperatureSensor && (
          <tr>
            <td>
              <FormattedMessage
                id="air-temperature"
                defaultMessage="Air temperature"
              >
                {(...content) => `${content}:`}
              </FormattedMessage>
            </td>
            <td>
              {`${airTemperatureSensor.sensorValue}
              ${airTemperatureSensor.sensorUnit}`}
            </td>
          </tr>
        )}
        {roadTemperatureSensor && (
          <tr>
            <td>
              <FormattedMessage
                id="road-temperature"
                defaultMessage="Road temperature"
              >
                {(...content) => `${content}:`}
              </FormattedMessage>
            </td>
            <td>
              {`${roadTemperatureSensor.sensorValue}
              ${roadTemperatureSensor.sensorUnit}`}
            </td>
          </tr>
        )}
        {rainSensor && (
          <tr>
            <td>
              <FormattedMessage id="rain" defaultMessage="Rain">
                {(...content) => `${content}:`}
              </FormattedMessage>
            </td>
            <td>
              {lang === 'fi'
                ? rainSensor.sensorValueDescriptionFi.toLowerCase()
                : rainSensor.sensorValueDescriptionEn.toLowerCase()}
            </td>
          </tr>
        )}
        {weatherSensor && (
          <tr>
            <td>
              <FormattedMessage id="condition" defaultMessage="Condition">
                {(...content) => `${content}:`}
              </FormattedMessage>
            </td>
            <td>
              {lang === 'fi'
                ? weatherSensor.sensorValueDescriptionFi.toLowerCase()
                : weatherSensor.sensorValueDescriptionEn.toLowerCase()}
            </td>
          </tr>
        )}
        {measuredTime && (
          <tr>
            <td colSpan={2} className="last-updated">
              <FormattedMessage id="last-updated" defaultMessage="Last updated">
                {(...content) => `${content} `}
              </FormattedMessage>
              {moment(measuredTime).format('HH:mm:ss') || ''}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

WeatherStationContent.displayName = 'WeatherStationContent';

WeatherStationContent.description = (
  <div>
    <p>RendTimeers content of a roadwork popup or modal</p>
    <ComponentUsageExample description="">
      <WeatherStationContent comment={exampleLang} />
    </ComponentUsageExample>
  </div>
);

WeatherStationContent.propTypes = {
  address: PropTypes.string,
  airTemperatureC: PropTypes.number,
  precipitationType: PropTypes.number,
  roadCondition: PropTypes.number,
  roadTemperatureC: PropTypes.number,
  updatedAt: PropTypes.string,
};

export default WeatherStationContent;
