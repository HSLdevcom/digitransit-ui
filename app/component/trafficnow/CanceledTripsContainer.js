import React from 'react';
import PropTypes from 'prop-types';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { connectToStores } from 'fluxible-addons-react';
import CanceledTrips from './CanceledTrips';
import CanceledTripsForModeQuery from './queries/CanceledTripsForModeQuery';
import { favouriteShape } from '../../util/shapes';
import { sortRoutes } from './utils';

const CanceledTripsContainer = ({
  mode,
  isMobile,
  favourites = [],
  dateTime,
}) => {
  const { canceledTripsSummary } = useLazyLoadQuery(CanceledTripsForModeQuery, {
    mode: mode.toUpperCase(),
    runningTimeRanges: [{ start: dateTime, end: null }],
  });
  const favRoutes = favourites.map(({ gtfsId }) => gtfsId);

  return (
    <CanceledTrips
      canceledRoutes={sortRoutes(canceledTripsSummary.routes, favRoutes)}
      mode={mode}
      isMobile={isMobile}
    />
  );
};
CanceledTripsContainer.propTypes = {
  mode: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
  favourites: PropTypes.arrayOf(favouriteShape),
  dateTime: PropTypes.string.isRequired,
};

const connectedComponent = connectToStores(
  CanceledTripsContainer,
  ['FavouriteStore'],
  context => ({
    favourites: context.getStore('FavouriteStore').getFavourites(),
  }),
);

export default connectedComponent;
