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

  return app;
};
