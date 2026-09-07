import React from 'react';
import PropTypes from 'prop-types';
import { useLazyLoadQuery } from 'react-relay/hooks';
import { connectToStores } from 'fluxible-addons-react';
import { DateTime } from 'luxon';
import CanceledTrips from './CanceledTrips';
import CanceledTripsForModeQuery from './queries/CanceledTripsForModeQuery';
import { favouriteShape } from '../../util/shapes';
import { sortRoutes } from './utils';
import { useFilterContext } from './filters/FiltersContext';
import { splitGtfsId } from '../../util/gtfs';
import { useConfigContext } from '../../configurations/ConfigContext';

const CanceledTripsContainer = ({ mode, isMobile, favourites = [] }) => {
  const { canceledTripsSummary } = useLazyLoadQuery(CanceledTripsForModeQuery, {
    mode: mode.toUpperCase(),
    serviceDateRanges: [{ start: DateTime.now().toISODate(), end: null }],
  });
  const favRoutes = favourites.map(({ gtfsId }) => gtfsId);
  const {
    selectedFilters: { selectedFeeds },
  } = useFilterContext();
  const { feedIds } = useConfigContext();

  const filteredRoutes = canceledTripsSummary.routes.filter(
    route =>
      (!selectedFeeds?.length &&
        feedIds.includes(splitGtfsId(route.route.gtfsId)?.feedId)) ||
      selectedFeeds?.includes(splitGtfsId(route.route.gtfsId)?.feedId),
  );

  return (
    <CanceledTrips
      canceledRoutes={sortRoutes(filteredRoutes, favRoutes)}
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
