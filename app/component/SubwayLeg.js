import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const SubwayLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="SUBWAY"
    leg={leg}
    focusAction={focusAction}
    index={index}
  >
    <FormattedMessage
      id="subway-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Metro {routeNumber} {headSign}"
    />
  </TransitLeg>
);

SubwayLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default SubwayLeg;
