import Fluxible from 'fluxible';

import routes from './routes';
import MessageStore from './store/MessageStore';
import OldSearchesStore from './store/OldSearchesStore';
import PositionStore from './store/PositionStore';
import OriginStore from './store/OriginStore';
import DestinationStore from './store/DestinationStore';
import PreferencesStore from './store/PreferencesStore';
import RealTimeInformationStore from './store/RealTimeInformationStore';
import TimeStore from './store/TimeStore';
import MapLayerStore from './store/MapLayerStore';
import GeoJsonStore from './store/GeoJsonStore';
import ViaPointStore from './store/ViaPointStore';
import FavouriteStore from './store/FavouriteStore';

export default config => {
  const app = new Fluxible({
    component: routes(config),
  });

  app.registerStore(MessageStore);
  app.registerStore(OldSearchesStore);
  app.registerStore(PositionStore);
  app.registerStore(OriginStore);
  app.registerStore(DestinationStore);
  app.registerStore(PreferencesStore);
  app.registerStore(RealTimeInformationStore);
  app.registerStore(TimeStore);
  app.registerStore(MapLayerStore);
  app.registerStore(GeoJsonStore);
  app.registerStore(ViaPointStore);
  app.registerStore(FavouriteStore);

  app.plug({
    name: 'extra-context-plugin',
    plugContext: () => {
      return {
        plugComponentContext: componentContext => {
          // eslint-disable-next-line no-param-reassign
          componentContext.config = config;
        },
        plugActionContext: actionContext => {
          // eslint-disable-next-line no-param-reassign
          actionContext.config = config;
        },
        plugStoreContext: storeContext => {
          // eslint-disable-next-line no-param-reassign
          storeContext.config = config;
        },
      };
    },
  });

  return app;
};
