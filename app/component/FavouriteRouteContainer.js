import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteRouteContainer = connectToStores(
  Favourite,
  ['FavouriteStore', 'UserStore', 'PreferencesStore'],
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
    isLoggedIn:
      context.config.allowLogin &&
      context.getStore('UserStore').getUser().sub !== undefined,
    getModalTranslations: () => {
      const translation = {
        language: context.getStore('PreferencesStore').getLanguage(),
        text: {
          login: context.intl.formatMessage({
            id: 'login',
            defaultMessage: 'Log in',
          }),
          cancel: context.intl.formatMessage({
            id: 'cancel',
            defaultMessage: 'cancel',
          }),
          headerText: context.intl.formatMessage({
            id: 'login-header',
            defautlMessage: 'Log in first',
          }),
          dialogContent: context.intl.formatMessage({
            id: 'login-content',
            defautlMessage: 'Log in first',
          }),
        },
      };
      return translation;
    },
  }),
);

FavouriteRouteContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default FavouriteRouteContainer;
