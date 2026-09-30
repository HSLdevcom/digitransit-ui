import { buildStaticMetaData } from '../../../../utils/server/metaUtils';

describe('buildStaticMetaData', () => {
  const config = {
    title: 'Test title',
    colors: { primary: '#000000' },
  };

  it('interpolates manifestName into every icon href', () => {
    const { link } = buildStaticMetaData(config, 'icons-test-abc123');
    link.forEach(({ href }) => {
      expect(href).toBe(`/assets/icons-test-abc123/${href.split('/').pop()}`);
    });
  });

  it('fills apple-mobile-web-app-title and application-name from config.title', () => {
    const { meta } = buildStaticMetaData(config, 'icons-test-abc123');
    const byName = name => meta.find(m => m.name === name).content;

    expect(byName('apple-mobile-web-app-title')).toBe('Test title');
    expect(byName('application-name')).toBe('Test title');
  });

  it('uses colors.topBarColor for theme-color when set', () => {
    const { meta } = buildStaticMetaData(
      { ...config, colors: { topBarColor: '#ff0000', primary: '#000000' } },
      'icons-test-abc123',
    );
    const themeColor = meta.find(m => m.name === 'theme-color').content;

    expect(themeColor).toBe('#ff0000');
  });

  it('falls back to colors.primary for theme-color when topBarColor is unset', () => {
    const { meta } = buildStaticMetaData(config, 'icons-test-abc123');
    const themeColor = meta.find(m => m.name === 'theme-color').content;

    expect(themeColor).toBe('#000000');
  });
});
