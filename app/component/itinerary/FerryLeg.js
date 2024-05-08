import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { legShape } from '../../util/shapes';

import TransitLeg from './TransitLeg';

const FerryLeg = ({ leg, ...props }) => (
  <TransitLeg mode="FERRY" leg={leg} {...props}>
    <FormattedMessage
      id="ferry-with-route-number"
      values={{
        routeNumber: leg.route?.shortName,
        headSign: leg.trip?.tripHeadsign,
      }}
      defaultMessage="Ferry {routeNumber} {headSign}"
    />
  </TransitLeg>
);

FerryLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};
export default FerryLeg;
