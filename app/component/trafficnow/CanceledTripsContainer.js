import React from 'react';
import PropTypes from 'prop-types';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { connectToStores } from 'fluxible-addons-react';
import { DateTime } from 'luxon';
import CanceledTrips from './CanceledTrips';
import CanceledTripsForModeQuery from './queries/CanceledTripsForModeQuery';
import { favouriteShape } from '../../util/shapes';

const CanceledTripsContainer = ({ mode, isMobile, favourites = [] }) => {
  const { canceledTripsSummary } = useLazyLoadQuery(CanceledTripsForModeQuery, {
    mode: mode.toUpperCase(),
    serviceDateRanges: [{ start: DateTime.now().toISODate(), end: null }],
  });
  const favRoutes = favourites.map(({ gtfsId }) => gtfsId);

  return (
    <CanceledTrips
      canceledRoutes={canceledTripsSummary.routes
        .slice()
        .sort(
          (a, b) =>
            Number(favRoutes.includes(b.route.gtfsId)) -
            Number(favRoutes.includes(a.route.gtfsId)),
        )}
      mode={mode}
      isMobile={isMobile}
    />
  );
};
CanceledTripsContainer.propTypes = {
  mode: PropTypes.string.isRequired,
  isMobile: PropTypes.bool,
  favourites: PropTypes.arrayOf(favouriteShape),
};

const connectedComponent = connectToStores(
  CanceledTripsContainer,
  ['FavouriteStore'],
  context => ({
    favourites: context.getStore('FavouriteStore').getFavourites(),
  }),
);

export default connectedComponent;
