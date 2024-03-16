import { Helmet } from 'react-helmet';
import compose from 'recompose/compose';
import getContext from 'recompose/getContext';
import mapProps from 'recompose/mapProps';
import { ConfigShape } from '../util/shapes';
import { generateManifestUrl } from '../util/manifestUtils';
import { isBrowser } from '../util/browser';

export default compose(
  getContext({ config: ConfigShape }),
  mapProps(({ config }) => {
    if (!isBrowser) {
      return false;
    }
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
