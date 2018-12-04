import { isBrowser } from '../util/browser';
import { generateManifestUrl } from '../util/manifestUtils';

/**
 * This helper function generates a manifest and some social media meta tags
 * based on the given parameters. Note that the manifest is only generated
 * when isBrowser===true.
 *
 * @param {{ title: string, description: string}} props The title and description to apply to the meta data.
 * @param {*} config The configuration for the software installation.
 * @param {*} location The current location.
 */
export const generateMetaData = ({ title, description }, config, location) => ({
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
  ...(isBrowser && {
    link: [
      {
        rel: 'manifest',
        href: generateManifestUrl(config, location, {
          title,
          description,
        }),
      },
    ],
  }),
});

export default generateMetaData;
