import React from 'react';
import PropTypes from 'prop-types';
import Favourite from './Favourite';
import { getFavouriteByStationIdAndNetworks } from '../data/FavouriteData';
import {
  useFavourites,
  useFavouriteStatus,
  useFavouriteActions,
} from '../hooks/FavouriteContext';
import { addAnalyticsEvent } from '../util/analyticsUtils';

export default function FavouriteVehicleRentalStationContainer({
  vehicleRentalStation,
  ...rest
}) {
  const favourites = useFavourites();
  const favouriteStatus = useFavouriteStatus();
  const { saveFavourite, deleteFavourite } = useFavouriteActions();

  const favourite = !!getFavouriteByStationIdAndNetworks(
    vehicleRentalStation.stationId,
    vehicleRentalStation.rentalNetwork.networkId,
    favourites,
  );

  return (
    <Favourite
      {...rest}
      favourite={favourite}
      isFetching={favouriteStatus === 'fetching'}
      addFavourite={() => {
        saveFavourite({
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
          name: !favourite,
        });
      }}
      delFavourite={() => {
        const vehicleRentalStationToDelete = getFavouriteByStationIdAndNetworks(
          vehicleRentalStation.stationId,
          vehicleRentalStation.rentalNetwork.networkId,
          favourites,
        );
        deleteFavourite(vehicleRentalStationToDelete);

        addAnalyticsEvent({
          category: 'BikeRentalStation',
          action: 'MarkBikeRentalStationAsFavourite',
          name: !favourite,
        });
      }}
    />
  );
}

FavouriteVehicleRentalStationContainer.propTypes = {
  vehicleRentalStation: PropTypes.shape({
    stationId: PropTypes.string.isRequired,
    lat: PropTypes.number,
    lon: PropTypes.number,
    name: PropTypes.string,
    rentalNetwork: PropTypes.shape({
      networkId: PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};
