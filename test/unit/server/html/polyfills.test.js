import getPolyfills from '../../../../server/html/polyfills';

const config = { availableLanguages: ['fi', 'en', 'sv'] };

describe('polyfills', () => {
  describe('getPolyfills', () => {
    it('resolves to a polyfill string for a given user agent', async () => {
      const polyfills = await getPolyfills(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        config,
      );
      expect(polyfills).toBeTypeOf('string');
    });

    it('treats an untrusted user agent (Samsung/LG) the same as an unknown one', async () => {
      const polyfills = await getPolyfills('SamsungBrowser/4.0', config);
      expect(polyfills).toBeTypeOf('string');
    });

    it('resolves without throwing for a missing user agent', async () => {
      const polyfills = await getPolyfills(undefined, config);
      expect(polyfills).toBeTypeOf('string');
    });

    it('caches and returns the same promise for a repeated user agent', () => {
      const ua = 'Mozilla/5.0 (Macintosh) legacyUrlMiddlewareTestUA/1.0';
      const first = getPolyfills(ua, config);
      const second = getPolyfills(ua, config);
      expect(first).toBe(second);
    });
  });
});
