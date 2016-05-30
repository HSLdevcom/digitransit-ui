import React from 'react';
import { FormattedMessage } from 'react-intl';

const RouteInformation = () => (
  <div className="itinerary-route-information row">
    <div className="small-6 columns">
      <FormattedMessage id="weather-at-destination" defaultMessage="Weather at destination" />
    </div>
    <div className="small-6 columns noborder">
      <FormattedMessage id="trip-co2-emissions" defaultMessage="Trip CO2 emissions" />
    </div>
  </div>
);

export default RouteInformation;
