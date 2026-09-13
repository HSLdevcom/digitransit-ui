import React from 'react';
import PropTypes from 'prop-types';
import { useLazyLoadQuery } from 'react-relay/hooks';
import CanceledTrips from './CanceledTrips.jsx';
import CanceledTripsForModeQuery from './queries/CanceledTripsForModeQuery.js';
import { sortRoutes } from './utils.js';
import { useFilterContext } from './filters/FiltersContext.jsx';
import { useFavourites } from '../../hooks/FavouriteContext.jsx';
import { splitGtfsId } from '../../util/gtfs.js';
import { useConfigContext } from '../../configurations/ConfigContext.jsx';

const CanceledTripsContainer = ({ mode, isMobile, dateTime }) => {
  const { canceledTripsSummary } = useLazyLoadQuery(CanceledTripsForModeQuery, {
    mode: mode.toUpperCase(),
    runningTimeRanges: [{ start: dateTime, end: null }],
  });
  const favourites = useFavourites();
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
  dateTime: PropTypes.string.isRequired,
};

export default CanceledTripsContainer;
