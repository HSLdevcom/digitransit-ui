import React from 'react';
import PropTypes from 'prop-types';
import Favourite from '../Favourite';
import {
  isFavourite as isFavouriteFn,
  getFavouriteByGtfsId,
} from '../../store/FavouriteStore';
import {
  useFavourites,
  useFavouriteStatus,
  useFavouriteActions,
} from '../../hooks/FavouriteContext';
import { addAnalyticsEvent } from '../../util/analyticsUtils';

export default function FavouriteRouteContainer({ gtfsId, ...rest }) {
  const favourites = useFavourites();
  const favouriteStatus = useFavouriteStatus();
  const { saveFavourite, deleteFavourite } = useFavouriteActions();

  const favourite = isFavouriteFn(favourites, gtfsId, 'route');

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
        const route = getFavouriteByGtfsId(favourites, gtfsId, 'route');
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
