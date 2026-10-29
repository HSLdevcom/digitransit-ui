import defaultGenerateMetaData, {
  generateMetaData,
} from '../../../../utils/client/metaUtils';

describe('metaUtils', () => {
  it('exports the same metadata function through default and named imports', () => {
    expect(defaultGenerateMetaData).toBe(generateMetaData);
  });

  describe('generateMetadata', () => {
    it('should return a title and an array of meta tags when config and location are missing', () => {
      const title = 'Foo';
      const description = 'Bar';
      const result = generateMetaData({ title, description });
      expect(result).toEqual({
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
