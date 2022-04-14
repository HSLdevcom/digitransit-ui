import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const FerryLeg = ({ leg, ...props }) => (
  <TransitLeg mode="FERRY" leg={leg} {...props}>
    <FormattedMessage
      id="ferry-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Ferry {routeNumber} {headSign}"
    />
  </TransitLeg>
);

FerryLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  interliningWait: PropTypes.number,
  isNextLegInterlining: PropTypes.bool,
};
export default FerryLeg;
