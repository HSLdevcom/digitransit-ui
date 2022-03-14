import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const BusLeg = ({ leg, ...props }) => (
  <TransitLeg
    mode={leg.route.type === 702 ? 'bus-trunk' : 'bus'}
    leg={leg}
    {...props}
  >
    <FormattedMessage
      id="bus-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Bus {routeNumber} {headSign}"
    />
  </TransitLeg>
);

BusLeg.propTypes = {
  leg: PropTypes.object.isRequired,
};

export default BusLeg;
