import React, { PropTypes } from 'react';
import TransitLeg from './TransitLeg';
import { FormattedMessage } from 'react-intl';

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
