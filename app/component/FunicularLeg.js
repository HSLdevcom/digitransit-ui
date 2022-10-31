import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const FunicularLeg = ({ leg, ...props }) => (
  <TransitLeg mode="FUNICULAR" leg={leg} {...props}>
    <FormattedMessage
      id="funicular-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Funicular {routeNumber} {headSign}"
    />
  </TransitLeg>
);

FunicularLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
  interliningWait: PropTypes.number,
  isNextLegInterlining: PropTypes.bool,
};
export default FunicularLeg;
