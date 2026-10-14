import { getPolyfillString } from '@mrhenry/polyfill-library';
import UA from '@financial-times/polyfill-useragent-normaliser';
import LRU from 'lru-cache';

const polyfillCache = new LRU(200);

export default function getPolyfills(userAgent, config) {
  // Serve the full bundle to missing UAs and to PageSpeed Insights
  if (!userAgent || /Google Page Speed Insights/.test(userAgent)) {
    userAgent = ''; // eslint-disable-line no-param-reassign
  }

  const ua = new UA(userAgent);
  const normalizedUA = UA.normalize(userAgent);
  let polyfill = polyfillCache.get(normalizedUA);

  if (polyfill) {
    return polyfill;
  }

  const features = {
    'caniuse:console-basic': { flags: ['gated'] },
    default: { flags: ['gated'] },
    es5: { flags: ['gated'] },
    es6: { flags: ['gated'] },
    es2017: { flags: ['gated'] },
    es2021: { flags: ['gated'] },
    es2022: { flags: ['gated'] },
    es2023: { flags: ['gated'] },
    fetch: { flags: ['gated'] },
    Intl: { flags: ['gated'] },
  };

  config.availableLanguages.forEach(language => {
    features[`Intl.~locale.${language}`] = {
      flags: ['gated'],
    };
  });

  polyfill = getPolyfillString({
    ua,
    features,
    minify: process.env.NODE_ENV !== 'development',
    unknown: 'polyfill',
  }).then(polyfills =>
    // no sourcemaps for inlined js
    polyfills.replace(/^\/\/# sourceMappingURL=.*$/gm, ''),
  );

  polyfillCache.set(normalizedUA, polyfill);
  return polyfill;
}
