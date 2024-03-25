import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { legShape } from '../util/shapes';

import TransitLeg from './TransitLeg';

const AirplaneLeg = ({ leg, focusAction, index }) => (
  <TransitLeg
    mode="AIRPLANE"
    leg={leg}
    focusAction={focusAction}
    index={index}
    omitDivider
  >
    <FormattedMessage
      id="airplane-with-route-number"
      values={{
        routeNumber: leg.route && leg.route.shortName,
      }}
      defaultMessage="Flight {routeNumber}"
    />
  </TransitLeg>
);

AirplaneLeg.propTypes = {
  leg: legShape.isRequired,
  index: PropTypes.number.isRequired,
  focusAction: PropTypes.func.isRequired,
};

export default AirplaneLeg;
