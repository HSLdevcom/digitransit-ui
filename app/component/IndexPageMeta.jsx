import React from 'react';
import { Helmet } from 'react-helmet';
import { configShape } from '../util/shapes.js';
import { generateManifestUrl } from '../util/manifestUtils.js';

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
