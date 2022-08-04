import PropTypes from 'prop-types';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import { getRouteMode } from '../util/modeUtils';
import TransitLeg from './TransitLeg';

const BusLeg = ({ leg, ...props }) => {
  const mode = getRouteMode({ mode: leg.mode, type: leg.route.type });
  return (
    <TransitLeg mode={mode} leg={leg} {...props}>
      <FormattedMessage
        id="bus-with-route-number"
        values={{
          routeNumber: leg.route && leg.route.shortName,
          headSign: leg.trip && leg.trip.tripHeadsign,
        }}
        defaultMessage="Bus {routeNumber} {headSign}"
      />
    </TransitLeg>
  );
};

BusLeg.propTypes = {
  leg: PropTypes.object.isRequired,
};

export default BusLeg;
