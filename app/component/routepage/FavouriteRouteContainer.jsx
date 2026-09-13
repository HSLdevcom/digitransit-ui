import React from 'react';
import PropTypes from 'prop-types';
import Favourite from '../Favourite.jsx';
import { isFavourite, getFavouriteByGtfsId } from '../../data/FavouriteData.js';
import {
  useFavourites,
  useFavouriteStatus,
  useFavouriteActions,
} from '../../hooks/FavouriteContext.jsx';
import { addAnalyticsEvent } from '../../util/analyticsUtils.js';

export default function FavouriteRouteContainer({ gtfsId, ...rest }) {
  const favourites = useFavourites();
  const favouriteStatus = useFavouriteStatus();
  const { saveFavourite, deleteFavourite } = useFavouriteActions();

  const favourite = isFavourite(gtfsId, 'route', favourites);

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
        const route = getFavouriteByGtfsId(gtfsId, 'route', favourites);
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
