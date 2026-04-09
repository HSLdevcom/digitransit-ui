import React from 'react';
import PropTypes from 'prop-types';
import { useLazyLoadQuery } from 'react-relay/hooks';
import CanceledTrips from './CanceledTrips';
import CanceledTripsForModeQuery from './queries/CanceledTripsForModeQuery';

const CanceledTripsContainer = ({ mode, isMobile }) => {
  const queryData = useLazyLoadQuery(CanceledTripsForModeQuery, {
    first: 1,
    mode: mode.toUpperCase(),
  });

  return <CanceledTrips query={queryData} mode={mode} isMobile={isMobile} />;
};
CanceledTripsContainer.propTypes = {
  mode: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
};

export default CanceledTripsContainer;
