import React from 'react';
import PropTypes from 'prop-types';
import { useLazyLoadQuery } from 'react-relay/hooks';
import CanceledTrips from './CanceledTrips';
import CanceledTripsForModeQuery from './queries/CanceledTripsForModeQuery';
import { sortRoutes } from './utils';
import { useFilterContext } from './filters/FiltersContext';
import { useFavourites } from '../../hooks/FavouriteContext';
import { splitGtfsId } from '../../util/gtfs';
import { useConfigContext } from '../../configurations/ConfigContext';

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
