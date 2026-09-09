import React from 'react';
import PropTypes from 'prop-types';
import Favourite from '../Favourite';
import favouriteStore from '../../data/FavouriteData';
import {
  useFavourites,
  useFavouriteStatus,
  useFavouriteActions,
} from '../../hooks/FavouriteContext';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

export default function FavouriteRouteContainer({ gtfsId, ...rest }) {
  useFavourites();
  const favouriteStatus = useFavouriteStatus();
  const { saveFavourite, deleteFavourite } = useFavouriteActions();

  const favourite = favouriteStore.isFavourite(gtfsId, 'route');

  return (
    <Favourite
      {...rest}
      favourite={favourite}
      isFetching={favouriteStatus === 'fetching'}
      addFavourite={() => {
        saveFavourite({ type: 'route', gtfsId });
        addAnalyticsEvent({
          category: 'Route',
          action: 'MarkRouteAsFavourite',
          name: !favourite,
        });
      }}
      delFavourite={() => {
        const route = favouriteStore.getFavouriteByGtfsId(gtfsId, 'route');
        deleteFavourite(route);
        addAnalyticsEvent({
          category: 'Route',
          action: 'MarkRouteAsFavourite',
          name: !favourite,
        });
      }}
    />
  );
}

FavouriteRouteContainer.propTypes = {
  gtfsId: PropTypes.string.isRequired,
};
