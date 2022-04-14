import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import TransitLeg from './TransitLeg';

const SubwayLeg = ({ leg, ...props }) => (
  <TransitLeg mode="SUBWAY" leg={leg} {...props}>
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
  interliningWait: PropTypes.number,
  isNextLegInterlining: PropTypes.bool,
};

export default SubwayLeg;
