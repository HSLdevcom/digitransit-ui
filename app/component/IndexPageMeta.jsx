import React from 'react';
import { Helmet } from 'react-helmet';
import { configShape } from '../../utils/client/shapes';
import { generateManifestUrl } from '../../utils/client/manifestUtils';

function IndexPageMeta(_, { config }) {
  const link = [
    {
      rel: 'manifest',
      href: generateManifestUrl(config, window.location, {
        ignorePathname: true,
      }),
    },
  ];

  return <Helmet link={link} />;
}

IndexPageMeta.contextTypes = {
  config: configShape.isRequired,
};

export default IndexPageMeta;
