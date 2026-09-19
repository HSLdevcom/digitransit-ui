import { expect } from 'chai';
import { describe, it } from 'mocha';
import getMetadata from '../../../../utils/shared/metaUtils';

function createMockConfig(overrides = {}) {
  return {
    title: 'Test app',
    iconPath: 'icons',
    URL: { ASSET_URL: '' },
    meta: { description: 'A test app', keywords: 'test' },
    socialMedia: {
      title: 'Test app',
      description: 'A test app',
      locale: 'en_US',
      image: { url: 'img/social.png', width: 1200, height: 630 },
      twitter: { card: 'summary_large_image', site: '@test' },
    },
    ...overrides,
  };
}

describe('getMetadata', () => {
  it('builds the base meta tags from config', () => {
    const { meta } = getMetadata(
      'fi',
      'example.com',
      'https://example.com/',
      createMockConfig(),
    );

    const byName = key =>
      meta.find(m => m.name === key || m.property === key).content;

    expect(byName('description')).to.equal('A test app');
    expect(byName('og:title')).to.equal('Test app');
    expect(byName('twitter:card')).to.equal('summary_large_image');
  });

  it('concatenates config.metaData onto the base meta and link arrays', () => {
    const config = createMockConfig({
      metaData: {
        meta: [{ name: 'theme-color', content: '#fff' }],
        link: [{ rel: 'apple-touch-icon', href: '/icon.png' }],
      },
    });

    const { meta, link } = getMetadata(
      'fi',
      'example.com',
      'https://example.com/',
      config,
    );

    expect(meta.some(m => m.name === 'theme-color')).to.equal(true);
    expect(link.some(l => l.rel === 'apple-touch-icon')).to.equal(true);
  });
});
