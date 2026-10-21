import Fluxible from 'fluxible';

import routes from '../routes/routes';

export default config =>
  new Fluxible({
    component: routes(config),
  });
