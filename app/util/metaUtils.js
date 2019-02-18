import { isBrowser } from './browser';
import { generateManifestUrl } from './manifestUtils';

/**
 * This helper function generates a manifest and some social media meta tags
 * based on the given parameters. Note that the manifest is only generated
 * when isBrowser===true.
 *
 * @param {{ title: string, description: string}} props The title and description to apply to the meta data.
 * @param {*} config The configuration for the software installation.
 * @param {{ pathname: string }} location The current location.
 */
export const generateMetaData = (
  { title, description },
  config,
  { pathname } = {},
) => ({
  title,
  meta: [
    {
      name: 'description',
      content: description,
    },
    {
      property: 'og:title',
      content: title,
    },
    {
      property: 'og:description',
      content: description,
    },
    {
      property: 'twitter:title',
      content: title,
    },
    {
      property: 'twitter:description',
      content: description,
    },
  ],
  ...(isBrowser &&
    config && {
      link: [
        {
          rel: 'manifest',
          href: generateManifestUrl(
            config,
            {
              host: window.location.host,
              pathname: pathname || window.location.pathname,
              protocol: window.location.protocol,
            },
            {
              title,
              description,
            },
          ),
        },
      ],
    }),
});

export default generateMetaData;
