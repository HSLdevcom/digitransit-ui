import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const connectedComponent = connectToStores(
  Favourite,
  ['FavouriteStore'],
  (context, { vehicleRentalStation }) => {
    const favouriteStore = context.getStore('FavouriteStore');

    return {
      favourite: favouriteStore.isFavourite(
        vehicleRentalStation.stationId,
        'bikeStation',
      ),
      isFetching: favouriteStore.getStatus() === 'fetching',
      addFavourite: () => {
        context.executeAction(saveFavourite, {
          lat: vehicleRentalStation.lat,
          lon: vehicleRentalStation.lon,
          network: vehicleRentalStation.rentalNetwork.networkId,
          name: vehicleRentalStation.name,
          stationId: vehicleRentalStation.stationId,
          type: 'bikeStation',
        });

        addAnalyticsEvent({
          category: 'BikeRentalStation',
          action: 'MarkBikeRentalStationAsFavourite',
          name: !favouriteStore.isFavourite(
            vehicleRentalStation.stationId,
            'bikeStation',
          ),
        });
      },
      delFavourite: () => {
        const vehicleRentalStationToDelete =
          favouriteStore.getByStationIdAndNetworks(
            vehicleRentalStation.stationId,
            vehicleRentalStation.rentalNetwork.networkId,
          );
        context.executeAction(deleteFavourite, vehicleRentalStationToDelete);

        addAnalyticsEvent({
          category: 'BikeRentalStation',
          action: 'MarkBikeRentalStationAsFavourite',
          name: !favouriteStore.isFavourite(
            vehicleRentalStation.stationId,
            'bikeStation',
          ),
        });
      },
    };
  },
);

connectedComponent.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
};

export default connectedComponent;
