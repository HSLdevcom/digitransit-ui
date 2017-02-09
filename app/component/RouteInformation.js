import React from 'react';
import { FormattedMessage } from 'react-intl';

const RouteInformation = () => (
  <div className="itinerary-route-information row">
    <div className="small-6 columns">
      <FormattedMessage id="weather-at-destination" defaultMessage="Weather at the destination" />
    </div>
    <div className="small-6 columns noborder">
      <FormattedMessage id="trip-co2-emissions" defaultMessage="CO2 emissions of the journey" />
    </div>
  </div>
);

export default RouteInformation;
