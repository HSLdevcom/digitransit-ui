import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { legShape } from '../../util/shapes';

import TransitLeg from './TransitLeg';

const FunicularLeg = ({ leg, ...props }) => (
  <TransitLeg mode="FUNICULAR" leg={leg} {...props}>
    <FormattedMessage
      id="funicular-with-route-number"
      values={{
        routeNumber: leg.route?.shortName,
        headSign: leg.trip?.tripHeadsign,
      }}
      defaultMessage="Funicular {routeNumber} {headSign}"
    />
  </TransitLeg>
);

FunicularLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};
export default FunicularLeg;
