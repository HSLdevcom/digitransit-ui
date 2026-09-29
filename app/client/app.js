import Fluxible from 'fluxible';

import routes from './routes';
import OldSearchesStore from '../store/OldSearchesStore';
import PositionStore from '../store/PositionStore';
import RealTimeInformationStore from '../store/RealTimeInformationStore';
import MapLayerStore from '../store/MapLayerStore';
import GeoJsonStore from '../store/GeoJsonStore';

export default config => {
  const app = new Fluxible({
    component: routes(config),
  });

  app.registerStore(OldSearchesStore);
  app.registerStore(PositionStore);
  app.registerStore(RealTimeInformationStore);
  app.registerStore(MapLayerStore);
  app.registerStore(GeoJsonStore);

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
