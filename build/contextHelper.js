/* eslint-disable global-require */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

const fs = require('fs');

const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

function getAllConfigs() {
  if (process.env.CONFIG && process.env.CONFIG !== '') {
    return [require('../app/config').getNamedConfiguration(process.env.CONFIG)];
  }

  const srcDirectory = './app/configurations';
  return fs
    .readdirSync(srcDirectory)
    .filter(file => /^config\.\w+\.js$/.test(file))
    .map(file => {
      const theme = file.replace('config.', '').replace('.js', '');
      return require('../app/config').getNamedConfiguration(theme);
    });
}

function getAllPossibleLanguages() {
  return getAllConfigs()
    .map(config => config.availableLanguages)
    .reduce((languages, languages2) => languages.concat(languages2)) // TODO use Set
    .filter(
      (language, position, languages) =>
        languages.indexOf(language) === position,
    );
}

function getEntries(theme, sprites) {
  let themeCss = `./sass/themes/${theme}/main.scss`;
  if (!fs.existsSync(themeCss)) {
    themeCss = './sass/themes/default/main.scss';
  }
  return {
    [`${theme}_theme`]: themeCss,
    [sprites]: `./static/${sprites}`,
  };
}

function getAllThemeEntries() {
  if (process.env.CONFIG && process.env.CONFIG !== '') {
    const config = require('../app/config').getNamedConfiguration(
      process.env.CONFIG,
    );

    return {
      ...getEntries('default'),
      ...getEntries(process.env.CONFIG, config.sprites),
    };
  }
  return getAllConfigs().reduce(
    (prev, config) => ({
      ...prev,
      ...getEntries(config.CONFIG, config.sprites),
    }),
    {},
  );
}

function faviconPluginFromConfig(config) {
  let logo =
    config.favicon ||
    `./app/configurations/images/${config.CONFIG}/favicon.png`;
  if (!fs.existsSync(logo)) {
    logo = './app/configurations/images/default/favicon.png';
  }

  return new FaviconsWebpackPlugin({
    // Your source logo
    logo,
    // The prefix for all image files (might be a folder or a name)
    prefix: `assets/icons-${config.CONFIG}-[hash]/`,
    // Emit all stats of the generated icons
    emitStats: true,
    // The name of the json containing all favicon information
    statsFilename: `assets/iconstats-${config.CONFIG}.json`,
    inject: false,
    // favicon background color (see https://github.com/haydenbleasel/favicons#usage)
    // This matches the application background color
    background: '#eef1f3',
    theme_color: config.colors ? config.colors.primary : '#eef1f3',
    // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
    title: config.title,
    appName: config.title,
    appDescription: config.meta.description,
    icons: {
      android: true,
      appleIcon: true,
      appleStartup: true,
      coast: false,
      favicons: true,
      firefox: true,
      opengraph: false,
      twitter: false,
      yandex: false,
      windows: false,
    },
  });
}

function getAllFaviconPlugins() {
  return getAllConfigs().map(faviconPluginFromConfig);
}

module.exports = {
  languages: getAllPossibleLanguages(),
  themeEntries: getAllThemeEntries(),
  faviconPlugins: getAllFaviconPlugins(),
};
