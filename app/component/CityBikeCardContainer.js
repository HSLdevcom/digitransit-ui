import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import CityBikeCard from './CityBikeCard';

import PreferencesStore from '../store/PreferencesStore';

const CityBikeCardContainer = connectToStores(
  CityBikeCard,
  [PreferencesStore],
  context => ({
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
