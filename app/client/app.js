import Fluxible from 'fluxible';

import routes from '../routes/routes';
import PositionStore from '../store/PositionStore';
import RealTimeInformationStore from '../store/RealTimeInformationStore';

export default config => {
  const app = new Fluxible({
    component: routes(config),
  });

  app.registerStore(PositionStore);
  app.registerStore(RealTimeInformationStore);

  app.plug({
    name: 'extra-context-plugin',
    plugContext: () => {
      return {
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
