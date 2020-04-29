import Fluxible from 'fluxible';

import routes from './routes';
import FavouriteLocationStore from './store/FavouriteLocationStore';
import FavouriteRoutesStore from './store/FavouriteRoutesStore';
import FavouriteStopsStore from './store/FavouriteStopsStore';
import MessageStore from './store/MessageStore';
import OldSearchesStore from './store/OldSearchesStore';
import PositionStore from './store/PositionStore';
import OriginStore from './store/OriginStore';
import PreferencesStore from './store/PreferencesStore';
import RealTimeInformationStore from './store/RealTimeInformationStore';
import TimeStore from './store/TimeStore';
import FavouriteCityBikeStationStore from './store/FavouriteCityBikeStationStore';
import MapLayerStore from './store/MapLayerStore';
import GeoJsonStore from './store/GeoJsonStore';
import CanceledLegsBarStore from './store/CanceledLegsBarStore';
import ViaPointsStore from './store/ViaPointsStore';
import UserStore from './store/UserStore';
import FavouriteStore from './store/FavouriteStore';

export default config => {
  const app = new Fluxible({
    component: routes(config),
  });

  app.registerStore(FavouriteLocationStore);
  app.registerStore(FavouriteRoutesStore);
  app.registerStore(FavouriteStopsStore);
  app.registerStore(MessageStore);
  app.registerStore(OldSearchesStore);
  app.registerStore(PositionStore);
  app.registerStore(OriginStore);
  app.registerStore(PreferencesStore);
  app.registerStore(RealTimeInformationStore);
  app.registerStore(TimeStore);
  app.registerStore(FavouriteCityBikeStationStore);
  app.registerStore(MapLayerStore);
  app.registerStore(GeoJsonStore);
  app.registerStore(CanceledLegsBarStore);
  app.registerStore(ViaPointsStore);
  app.registerStore(UserStore);
  app.registerStore(FavouriteStore);

  app.plug({
    name: 'extra-context-plugin',
    plugContext: options => {
      let { headers } = options;
      return {
        plugComponentContext: componentContext => {
          // eslint-disable-next-line no-param-reassign
          componentContext.config = config;
          // eslint-disable-next-line no-param-reassign
          componentContext.headers = headers;
        },
        plugActionContext: actionContext => {
          // eslint-disable-next-line no-param-reassign
          actionContext.config = config;
        },
        plugStoreContext: storeContext => {
          // eslint-disable-next-line no-param-reassign
          storeContext.config = config;
        },
        dehydrate() {
          return {
            headers,
            config,
          };
        },
        rehydrate(state) {
          ({ config, headers } = state); // eslint-disable-line no-param-reassign
        },
      };
    },
    dehydrate: () => ({}),
    rehydrate: () => {},
  });

  return app;
};
