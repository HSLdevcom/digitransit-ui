import { expect } from 'chai';
import { describe, it } from 'mocha';

import { generateMetaData } from '../../../app/util/metaUtils';

describe('metaUtils', () => {
  describe('generateMetadata', () => {
    it('should return a title and an array of meta tags when config and location are missing', () => {
      const title = 'Foo';
      const description = 'Bar';
      const result = generateMetaData({ title, description });
      expect(result).to.deep.equal({
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
      });
    });
  });
});
