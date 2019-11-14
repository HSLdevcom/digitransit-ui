import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { addFavouriteRoute } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteRouteContainer = connectToStores(
  Favourite,
  ['FavouriteRoutesStore'],
  (context, { gtfsId }) => ({
    favourite: context.getStore('FavouriteRoutesStore').isFavourite(gtfsId),
    addFavourite: () => {
      context.executeAction(addFavouriteRoute, gtfsId);
      addAnalyticsEvent({
        category: 'Route',
        action: 'MarkRouteAsFavourite',
        name: !context.getStore('FavouriteRoutesStore').isFavourite(gtfsId),
      });
    },
  }),
);

FavouriteRouteContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default FavouriteRouteContainer;
