import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addMessage } from '../action/MessageActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import failedFavouriteMessage from '../util/messageUtils';

const FavouriteRouteContainer = connectToStores(
  Favourite,
  ['FavouriteStore', 'UserStore', 'PreferencesStore'],
  (context, { gtfsId }) => ({
    favourite: context.getStore('FavouriteStore').isFavourite(gtfsId, 'route'),
    addFavourite: () => {
      context.executeAction(
        saveFavourite,
        { type: 'route', gtfsId },
        context.executeAction(
          addMessage,
          failedFavouriteMessage('route', true),
        ),
      );
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
      context.executeAction(
        deleteFavourite,
        route,
        context.executeAction(
          addMessage,
          failedFavouriteMessage('route', false),
        ),
      );
      addAnalyticsEvent({
        category: 'Route',
        action: 'MarkRouteAsFavourite',
        name: !context.getStore('FavouriteStore').isFavourite(gtfsId, 'route'),
      });
    },
    allowLogin: context.config.allowLogin,
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
