import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const FerryLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="FERRY"
    leg={leg}
    focusAction={focusAction}
    index={index}
  >
    <FormattedMessage
      id="ferry-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
        headSign: leg.trip && leg.trip.tripHeadsign,
      }}
      defaultMessage="Ferry {routeNumber} {headSign}"
    /></TransitLeg>);

FerryLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};
export default FerryLeg;
