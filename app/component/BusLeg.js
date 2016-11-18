import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const BusLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="BUS"
    leg={leg}
    focusAction={focusAction}
    index={index}
  >
    <FormattedMessage
      id="bus-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }} defaultMessage="Bus {routeNumber} {headSign}"
    />
  </TransitLeg>
);

BusLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default BusLeg;
