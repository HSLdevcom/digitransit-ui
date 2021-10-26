import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const BusLeg = ({ leg, ...props }) => (
  <TransitLeg mode="BUS" leg={leg} {...props}>
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
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  interliningWait: PropTypes.number,
  nextInterliningLeg: PropTypes.any,
};

export default BusLeg;
