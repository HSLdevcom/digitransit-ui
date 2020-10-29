import PropTypes from 'prop-types';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape } from 'react-intl';
import Favourite from './Favourite';
import { saveFavourite, deleteFavourite } from '../action/FavouriteActions';
import { addAnalyticsEvent } from '../util/analyticsUtils';

const FavouriteBikeRentalStationContainer = connectToStores(
  Favourite,
  ['FavouriteStore', 'UserStore', 'PreferencesStore'],
  (context, { bikeRentalStation }) => ({
    favourite: context
      .getStore('FavouriteStore')
      .isFavouriteBikeRentalStation(
        bikeRentalStation.stationId,
        bikeRentalStation.networks,
      ),
    addFavourite: () => {
      context.executeAction(saveFavourite, {
        lat: bikeRentalStation.lat,
        lon: bikeRentalStation.lon,
        networks: bikeRentalStation.networks,
        name: bikeRentalStation.name,
        stationId: bikeRentalStation.stationId,
        type: 'bikeStation',
      });
      addAnalyticsEvent({
        category: 'BikeRentalStation',
        action: 'MarkBikeRentalStationAsFavourite',
        name: !context
          .getStore('FavouriteStore')
          .isFavouriteBikeRentalStation(
            bikeRentalStation.stationId,
            bikeRentalStation.networks,
          ),
      });
    },
    deleteFavourite: () => {
      const bikeRentalStationToDelete = context
        .getStore('FavouriteStore')
        .getByStationIdAndNetworks(
          bikeRentalStation.stationId,
          bikeRentalStation.networks,
        );
      context.executeAction(deleteFavourite, bikeRentalStationToDelete);
      addAnalyticsEvent({
        category: 'BikeRentalStation',
        action: 'MarkBikeRentalStationAsFavourite',
        name: !context
          .getStore('FavouriteStore')
          .isFavouriteBikeRentalStation(
            bikeRentalStation.stationId,
            bikeRentalStation.networks,
          ),
      });
    },
    allowLogin: context.config.allowLogin || false,
    isLoggedIn:
      context.config.allowLogin &&
      context.getStore('UserStore').getUser().sub !== undefined,
    getModalTranslations: () => {
      const translation = {
        language: context.getStore('PreferencesStore').getLanguage(),
        text: {
          login: context.intl.formatMessage({
            id: 'login',
            defaultMessage: 'Log in',
          }),
          cancel: context.intl.formatMessage({
            id: 'cancel',
            defaultMessage: 'cancel',
          }),
          headerText: context.intl.formatMessage({
            id: 'login-header',
            defautlMessage: 'Log in first',
          }),
          dialogContent: context.intl.formatMessage({
            id: 'login-content',
            defautlMessage: 'Log in first',
          }),
        },
      };
      return translation;
    },
  }),
);

FavouriteBikeRentalStationContainer.contextTypes = {
  getStore: PropTypes.func.isRequired,
  executeAction: PropTypes.func.isRequired,
  config: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
};

export default FavouriteBikeRentalStationContainer;
