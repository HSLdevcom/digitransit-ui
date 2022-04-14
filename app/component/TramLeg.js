import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const TramLeg = ({ leg, ...props }) => (
  <TransitLeg mode="TRAM" leg={leg} {...props}>
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

TramLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  interliningWait: PropTypes.number,
  isNextLegInterlining: PropTypes.bool,
};

export default TramLeg;
