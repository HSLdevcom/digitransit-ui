import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { addFavouriteRoute } from '../action/FavouriteActions';

const FavouriteRouteContainer = connectToStores(Favourite, ['FavouriteRoutesStore'],
  (context, { gtfsId }) => ({
    favourite: context.getStore('FavouriteRoutesStore').isFavourite(gtfsId),
    addFavourite: () => context.executeAction(addFavouriteRoute, gtfsId),
  }),
);

FavouriteRouteContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default FavouriteRouteContainer;
