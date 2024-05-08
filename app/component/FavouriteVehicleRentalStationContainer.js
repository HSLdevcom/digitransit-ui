import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { configShape } from '../util/shapes';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteVehicleRentalStationContainer = connectToStores(
  Favourite,
  ['FavouriteStore', 'UserStore', 'PreferencesStore'],
  (context, { vehicleRentalStation }) => ({
    favourite: context
      .getStore('FavouriteStore')
      .isFavourite(vehicleRentalStation.stationId, 'bikeStation'),
    isFetching: context.getStore('FavouriteStore').getStatus() === 'fetching',
    addFavourite: () => {
      context.executeAction(saveFavourite, {
        lat: vehicleRentalStation.lat,
        lon: vehicleRentalStation.lon,
        network: vehicleRentalStation.network,
        name: vehicleRentalStation.name,
        stationId: vehicleRentalStation.stationId,
        type: 'bikeStation',
      });
      addAnalyticsEvent({
        category: 'BikeRentalStation',
        action: 'MarkBikeRentalStationAsFavourite',
        name: !context
          .getStore('FavouriteStore')
          .isFavourite(vehicleRentalStation.stationId, 'bikeStation'),
      });
    },
    deleteFavourite: () => {
      const vehicleRentalStationToDelete = context
        .getStore('FavouriteStore')
        .getByStationIdAndNetworks(
          vehicleRentalStation.stationId,
          vehicleRentalStation.network,
        );
      context.executeAction(deleteFavourite, vehicleRentalStationToDelete);
      addAnalyticsEvent({
        category: 'BikeRentalStation',
        action: 'MarkBikeRentalStationAsFavourite',
        name: !context
          .getStore('FavouriteStore')
          .isFavourite(vehicleRentalStation.stationId, 'bikeStation'),
      });
    },
    requireLoggedIn: !context.config.allowFavouritesFromLocalstorage,
    isLoggedIn:
      context.config.allowLogin &&
      context.getStore('UserStore').getUser().sub !== undefined,
    language: context.getStore('PreferencesStore').getLanguage(),
  }),
);

FavouriteVehicleRentalStationContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
  config: configShape.isRequired,
};

export default FavouriteVehicleRentalStationContainer;
