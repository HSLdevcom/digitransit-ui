import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { addFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteStopContainer = connectToStores(
  Favourite,
  ['FavouriteStore'],
  (context, { gtfsId }) => ({
    favourite: context.getStore('FavouriteStore').isFavourite(gtfsId),
    addFavourite: () => {
      context.executeAction(addFavourite, { type: 'stop', gtfsId });
      addAnalyticsEvent({
        category: 'Stop',
        action: 'MarkStopAsFavourite',
        name: !context.getStore('FavouriteStore').isFavourite(gtfsId),
      });
    },
    deleteFavourite: () => {
      const stop = context.getStore('FavouriteStore').getByGtfsId(gtfsId);
      context.executeAction(deleteFavourite, stop);
      addAnalyticsEvent({
        category: 'Stop',
        action: 'MarkStopAsFavourite',
        name: !context.getStore('FavouriteStore').isFavourite(gtfsId),
      });
    },
  }),
);

FavouriteStopContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default FavouriteStopContainer;
