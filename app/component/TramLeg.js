import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { getRouteMode } from '../util/modeUtils';

import TransitLeg from './TransitLeg';

const TramLeg = ({ leg, ...props }) => {
  const mode = getRouteMode({ mode: leg.mode, type: leg.route?.type });
  return (
    <TransitLeg mode={mode} leg={leg} {...props}>
      <FormattedMessage
        id="tram-with-route-number"
        values={{
          routeNumber: leg.route?.shortName,
          headSign: leg.trip?.tripHeadsign,
        }}
        defaultMessage="Tram {routeNumber} {headSign}"
      />
    </TransitLeg>
  );
};

TramLeg.propTypes = {
  leg: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

export default TramLeg;
