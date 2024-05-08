import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import TransitLeg from './TransitLeg';
import { legShape } from '../../util/shapes';

export default function SubwayLeg({ leg, ...props }) {
  return (
    <TransitLeg mode="SUBWAY" leg={leg} {...props}>
      <FormattedMessage
        id="subway-with-route-number"
        values={{
          routeNumber: leg.route?.shortName,
          headSign: leg.trip?.tripHeadsign,
        }}
        defaultMessage="Metro {routeNumber} {headSign}"
      />
    </TransitLeg>
  );
}

SubwayLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};
