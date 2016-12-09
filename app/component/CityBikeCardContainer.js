import React from 'react';
import connectToStores from 'fluxible-addons-react/connectToStores';
import CityBikeCard from './CityBikeCard';
import { toggleFavouriteCityBikeStation } from '../action/FavouriteActions';

const CityBikeCardContainer = connectToStores(CityBikeCard, ['FavouriteCityBikeStationStore'],
  (context, props) => ({
    isFavourite:
      context.getStore('FavouriteCityBikeStationStore').isFavourite(props.station.stationId),
    toggleFavourite: (e) => { // TODO: this is bad in terms of performance, consider reselect
      e.preventDefault();
      context.executeAction(toggleFavouriteCityBikeStation, props.station.stationId);
    },
  }),
);

CityBikeCardContainer.propTypes = {
  station: React.PropTypes.object.isRequired,
  className: React.PropTypes.string,
  children: React.PropTypes.node,
};

CityBikeCardContainer.contextTypes = {
  executeAction: React.PropTypes.func.isRequired,
  getStore: React.PropTypes.func.isRequired,
};

export default CityBikeCardContainer;
