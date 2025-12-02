import React from 'react';
import { Helmet } from 'react-helmet';
import { configShape } from '../util/shapes';
import { generateManifestUrl } from '../util/manifestUtils';

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
