export default function getMetadata(lang, host, url, config) {
  const configName = config.CONFIG;
  const root = config.APP_PATH;
  const iconPath = `${root}/${configName}-icons/`;

  return {
    title: config.title,

    meta: [{
      'http-equiv': 'x-ua-compatible',
      content: 'ie=edge',
    }, {
      'http-equiv': 'Content-Language',
      content: lang,
    }, {
      name: 'charset',
      content: 'utf-8',
    }, {
      name: 'description',
      content: config.meta.description,
    }, {
      name: 'keywords',
      content: config.meta.keywords,
    }, {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1 user-scalable=no, minimal-ui',
    }, {
      name: 'mobile-web-app-capable',
      content: 'yes',
    }, {
      name: 'apple-mobile-web-app-capable',
      content: 'yes',
    }, {
      name: 'msapplication-config',
      content: `${iconPath}browserconfig.xml`,
    }, {
      name: 'msapplication-TileColor',
      content: `${config.colors.primary}`,
    }, {
      name: 'msapplication-TileImage',
      content: `${iconPath}ms-icon-144x144.png`,
    }, {
      name: 'theme-color',
      content: '#fff',
    }, {
      property: 'og:url',
      content: `https://${host}${url}`,
    }, {
      property: 'og:type',
      content: 'website',
    }, {
      property: 'og:title',
      content: config.socialMedia.title,
    }, {
      property: 'og:site_name',
      content: config.socialMedia.title,
    }, {
      property: 'og:description',
      content: config.socialMedia.description,
    }, {
      property: 'og:image',
      content: `https://${host}${config.socialMedia.image.url}`,
    }, {
      property: 'og:image:width',
      content: config.socialMedia.image.width,
    }, {
      property: 'og:image:height',
      content: config.socialMedia.image.height,
    }, {
      property: 'og:locale',
      content: config.socialMedia.locale,
    }, {
      property: 'twitter:card',
      content: config.socialMedia.twitter.card,
    }, {
      property: 'twitter:site',
      content: config.socialMedia.twitter.site,
    }, {
      property: 'twitter:creator',
      content: config.socialMedia.twitter.site,
    }, {
      property: 'twitter:title',
      content: config.socialMedia.title,
    }, {
      property: 'twitter:description',
      content: config.socialMedia.description,
    }, {
      property: 'twitter:image',
      content: `https://${host}${config.socialMedia.image.url}`,
    }],

    link: [{
      rel: 'manifest',
      href: `${iconPath}manifest.json`,
    }],
  };
}
