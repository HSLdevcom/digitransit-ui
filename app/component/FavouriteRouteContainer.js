import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteRouteContainer = connectToStores(
  Favourite,
  ['FavouriteStore'],
  (context, { gtfsId }) => ({
    favourite: context.getStore('FavouriteStore').isFavourite(gtfsId, 'route'),
    addFavourite: () => {
      context.executeAction(saveFavourite, { type: 'route', gtfsId });
      addAnalyticsEvent({
        category: 'Route',
        action: 'MarkRouteAsFavourite',
        name: !context.getStore('FavouriteStore').isFavourite(gtfsId, 'route'),
      });
    },
    deleteFavourite: () => {
      const route = context
        .getStore('FavouriteStore')
        .getByGtfsId(gtfsId, 'route');
      context.executeAction(deleteFavourite, route);
      addAnalyticsEvent({
        category: 'Route',
        action: 'MarkRouteAsFavourite',
        name: !context.getStore('FavouriteStore').isFavourite(gtfsId, 'route'),
      });
    },
  }),
);

FavouriteRouteContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default FavouriteRouteContainer;
