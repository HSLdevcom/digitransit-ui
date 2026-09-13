import Fluxible from 'fluxible';

import routes from './routes.jsx';
import MessageStore from './store/MessageStore.js';
import OldSearchesStore from './store/OldSearchesStore.js';
import PositionStore from './store/PositionStore.js';
import OriginStore from './store/OriginStore.js';
import DestinationStore from './store/DestinationStore.js';
import RealTimeInformationStore from './store/RealTimeInformationStore.js';
import MapLayerStore from './store/MapLayerStore.js';
import GeoJsonStore from './store/GeoJsonStore.js';
import ViaPointStore from './store/ViaPointStore.js';

export default config => {
  const app = new Fluxible({
    component: routes(config),
  });

  app.registerStore(MessageStore);
  app.registerStore(OldSearchesStore);
  app.registerStore(PositionStore);
  app.registerStore(OriginStore);
  app.registerStore(DestinationStore);
  app.registerStore(RealTimeInformationStore);
  app.registerStore(MapLayerStore);
  app.registerStore(GeoJsonStore);
  app.registerStore(ViaPointStore);

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
