import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';

import TransitLeg from './TransitLeg';

const RailLeg = ({ leg, ...props }) => (
  <TransitLeg mode="RAIL" leg={leg} {...props}>
    <FormattedMessage
      id="rail-with-route-number"
      values={{
        routeNumber: leg.route?.shortName,
        headSign: leg.trip?.tripHeadsign,
      }}
      defaultMessage="Train {routeNumber} {headSign}"
    />
  </TransitLeg>
);

RailLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default RailLeg;
