import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteStopContainer = connectToStores(
  Favourite,
  ['FavouriteStore'],
  (context, { stop, isTerminal }) => ({
    favourite: context
      .getStore('FavouriteStore')
      .isFavourite(stop.gtfsId, isTerminal ? 'station' : 'stop'),
    addFavourite: () => {
      context.executeAction(saveFavourite, {
        ...stop,
        type: isTerminal ? 'station' : 'stop',
        layer: isTerminal ? '' : 'stop',
        address: stop.desc || '',
      });
      addAnalyticsEvent({
        category: 'Stop',
        action: 'MarkStopAsFavourite',
        name: !context
          .getStore('FavouriteStore')
          .isFavourite(stop.gtfsId, isTerminal ? 'station' : 'stop'),
      });
    },
    deleteFavourite: () => {
      const stopToDelete = context
        .getStore('FavouriteStore')
        .getByGtfsId(stop.gtfsId, isTerminal ? 'station' : 'stop');
      context.executeAction(deleteFavourite, stopToDelete);
      addAnalyticsEvent({
        category: 'Stop',
        action: 'MarkStopAsFavourite',
        name: !context
          .getStore('FavouriteStore')
          .isFavourite(stop.gtfsId, isTerminal ? 'station' : 'stop'),
      });
    },
  }),
);

FavouriteStopContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default FavouriteStopContainer;
