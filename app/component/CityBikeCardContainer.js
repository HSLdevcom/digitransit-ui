import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import CityBikeCard from './CityBikeCard';

import { toggleFavouriteCityBikeStation } from '../action/FavouriteActions';
import PreferencesStore from '../store/PreferencesStore';

const CityBikeCardContainer = connectToStores(
  CityBikeCard,
  ['FavouriteCityBikeStationStore', PreferencesStore],
  (context, props) => ({
    isFavourite: context
      .getStore('FavouriteCityBikeStationStore')
      .isFavourite(props.station.stationId),
    toggleFavourite: e => {
      // TODO: this is bad in terms of performance, consider reselect
      e.preventDefault();
      context.executeAction(
        toggleFavouriteCityBikeStation,
        props.station.stationId,
      );
    },
    language: context.getStore(PreferencesStore).getLanguage(),
  }),
);

CityBikeCardContainer.propTypes = {
  station: PropTypes.object.isRequired,
  className: PropTypes.string,
  children: PropTypes.node,
};

CityBikeCardContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
};

export default CityBikeCardContainer;
