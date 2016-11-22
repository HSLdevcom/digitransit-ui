import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const TramLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="TRAM"
    leg={leg}
    focusAction={focusAction}
    index={index}
  >
    <FormattedMessage
      id="tram-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }} defaultMessage="Tram {routeNumber} {headSign}"
    /></TransitLeg>
  );

TramLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default TramLeg;
