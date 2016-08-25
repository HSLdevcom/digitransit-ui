import React, { PropTypes } from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const RailLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="RAIL"
    leg={leg}
    focusAction={focusAction}
    index={index}
  ><FormattedMessage
    id="train-with-route-number"
    values={{
      routeNumber: leg.route && leg.route.shortName,
      headSign: leg.trip && leg.trip.tripHeadsign,
    }}
    defaultMessage="Train {routeNumber} {headSign}"
  /></TransitLeg>
);


RailLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default RailLeg;
