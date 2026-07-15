import React from 'react';
import PropTypes from 'prop-types';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { DateTime } from 'luxon';
import CanceledTrips from './CanceledTrips';
import CanceledTripsForModeQuery from './queries/CanceledTripsForModeQuery';

const CanceledTripsContainer = ({ mode, isMobile }) => {
  const { canceledTripsSummary } = useLazyLoadQuery(CanceledTripsForModeQuery, {
    mode: mode.toUpperCase(),
    serviceDateRanges: [{ start: DateTime.now().toISODate(), end: null }],
  });

  return (
    <CanceledTrips
      canceledRoutes={canceledTripsSummary.routes}
      mode={mode}
      isMobile={isMobile}
    />
  );
};
CanceledTripsContainer.propTypes = {
  mode: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
};

export default CanceledTripsContainer;
