import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { addFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteRouteContainer = connectToStores(
  Favourite,
  ['FavouriteStore'],
  (context, { gtfsId }) => ({
    favourite: context.getStore('FavouriteStore').isFavourite(gtfsId),
    addFavourite: () => {
      context.executeAction(addFavourite, { type: 'route', gtfsId });
      addAnalyticsEvent({
        category: 'Route',
        action: 'MarkRouteAsFavourite',
        name: !context.getStore('FavouriteStore').isFavourite(gtfsId),
      });
    },
    deleteFavourite: () => {
      const route = context.getStore('FavouriteStore').getByGtfsId(gtfsId);
      context.executeAction(deleteFavourite, route);
      addAnalyticsEvent({
        category: 'Route',
        action: 'MarkRouteAsFavourite',
        name: !context.getStore('FavouriteStore').isFavourite(gtfsId),
      });
    },
  }),
);

FavouriteRouteContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default FavouriteRouteContainer;
