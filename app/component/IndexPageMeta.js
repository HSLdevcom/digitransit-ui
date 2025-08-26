import { Helmet } from 'react-helmet';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import mapProps from 'recompose/mapProps';
import { configShape } from '../util/shapes';
import { generateManifestUrl } from '../util/manifestUtils';

export default compose(
  getContext({ config: configShape }),
  mapProps(({ config }) => {
    return {
      link: [
        {
          rel: 'manifest',
          href: generateManifestUrl(config, window.location, {
            ignorePathname: true,
          }),
        },
      ],
    };
  }),
)(Helmet);
