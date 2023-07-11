import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const SpeedTramLeg = ({ leg, ...props }) => (
  <TransitLeg mode="SPEEDTRAM" leg={leg} {...props}>
    <FormattedMessage
      id="tram-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Tram {routeNumber} {headSign}"
    />
  </TransitLeg>
);

SpeedTramLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  interliningWait: PropTypes.number,
  isNextLegInterlining: PropTypes.bool,
};

export default SpeedTramLeg;
