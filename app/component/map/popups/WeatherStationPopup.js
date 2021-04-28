import PropTypes from 'prop-types';
import React from 'react';
import { intlShape } from 'react-intl';
import Card from '../../Card';
import CardHeader from '../../CardHeader';
import WeatherStationContent from '../../WeatherStationContent';
import ComponentUsageExample from '../../ComponentUsageExample';

function WeatherStationPopup(props, { intl }) {
  return (
    <div className="card">
      <Card className="padding-small">
        <CardHeader
          name={intl.formatMessage({
            id: 'road-weather',
            defaultMessage: 'Road weather',
          })}
          description={props.address}
          icon="icon-icon_monitor"
          unlinked
        />
        <WeatherStationContent {...props} />
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
  address: PropTypes.string,
};

WeatherStationPopup.contextTypes = {
  intl: intlShape.isRequired,
};

export default WeatherStationPopup;
