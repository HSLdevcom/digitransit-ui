// Static favicon/apple-touch-icon/PWA-capability meta and link tags, shared
// by every deployment. `manifestName` is the `icons-<CONFIG>-<hash>`
// directory favicons-webpack-plugin generated for this config's build.
export function buildStaticMetaData(config, manifestName) {
  const iconHref = filename => `/assets/${manifestName}/${filename}`;

  return {
    link: [
      ...[57, 60, 72, 76, 114, 120, 144, 152, 180].map(size => ({
        rel: 'apple-touch-icon',
        sizes: `${size}x${size}`,
        href: iconHref(`apple-touch-icon-${size}x${size}.png`),
      })),
      ...[32, 16].map(size => ({
        rel: 'icon',
        type: 'image/png',
        sizes: `${size}x${size}`,
        href: iconHref(`favicon-${size}x${size}.png`),
      })),
      { rel: 'shortcut icon', href: iconHref('favicon.ico') },
    ],
    meta: [
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
      { name: 'apple-mobile-web-app-title', content: config.title },
      { name: 'mobile-web-app-capable', content: 'yes' },
      {
        name: 'theme-color',
        content: config.colors.topBarColor || config.colors.primary,
      },
      { name: 'application-name', content: config.title },
    ],
  };
}
