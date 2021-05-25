import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteRouteContainer = connectToStores(
  Favourite,
  ['FavouriteStore', 'UserStore', 'PreferencesStore'],
  (context, { gtfsId }) => ({
    favourite: context.getStore('FavouriteStore').isFavourite(gtfsId, 'route'),
    isFetching: context.getStore('FavouriteStore').getStatus() === 'fetching',
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
    requireLoggedIn: !context.config.allowFavouritesFromLocalstorage,
    isLoggedIn:
      context.config.allowLogin &&
      context.getStore('UserStore').getUser().sub !== undefined,
    language: context.getStore('PreferencesStore').getLanguage(),
  }),
);

FavouriteRouteContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
};

export default FavouriteRouteContainer;
