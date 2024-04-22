import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import TransitLeg from './TransitLeg';
import { legShape } from '../../util/shapes';

export default function RailLeg({ leg, ...props }) {
  return (
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
}

RailLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};
