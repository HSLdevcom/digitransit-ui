/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

import fs from 'fs';

import FaviconsWebpackPlugin from 'favicons-webpack-plugin';

import { getNamedConfiguration } from '../../server/configs/config.js';

// Configs that only serve as a runtime `BASE_CONFIG` merge base, never a deployable `CONFIG` value.
const BASE_ONLY_CONFIGS = ['waltti'];

function getAllConfigs() {
  if (process.env.CONFIG && process.env.CONFIG !== '') {
    return [getNamedConfiguration(process.env.CONFIG)];
  }

  const srcDirectory = './server/configs';
  return fs
    .readdirSync(srcDirectory)
    .filter(file => /^config\.\w+\.js$/.test(file))
    .map(file => file.replace('config.', '').replace('.js', ''))
    .filter(theme => !BASE_ONLY_CONFIGS.includes(theme))
    .map(theme => getNamedConfiguration(theme));
}

function getEntries(theme, sprites = null) {
  let themeCss = `./sass/themes/${theme}/main.scss`;
  if (!fs.existsSync(themeCss)) {
    themeCss = './sass/themes/default/main.scss';
  }
  return {
    [`${theme}_theme`]: themeCss,
    ...(sprites !== null
      ? {
          [sprites]: `./static/${sprites}`,
        }
      : {}),
  };
}

function getAllThemeEntries() {
  if (process.env.CONFIG && process.env.CONFIG !== '') {
    const config = getNamedConfiguration(process.env.CONFIG);

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
    `./app/client/images/${config.CONFIG}/${config.CONFIG}-favicon.png`;
  if (!fs.existsSync(logo)) {
    logo = './app/client/images/default/default-favicon.png';
  }

  return new FaviconsWebpackPlugin({
    // Your source logo
    logo,
    // The prefix for all image files (might be a folder or a name)
    prefix: `assets/icons-${config.CONFIG}-[contenthash]/`,
    // Emit all stats of the generated icons
    emitStats: true,
    // The name of the json containing all favicon information
    statsFilename: `assets/iconstats-${config.CONFIG}.json`,
    inject: false,
    // Options for the `favicons` package itself. The plugin only reads them
    // from here; at the top level they're silently ignored.
    favicons: {
      // Matches the `favicons` package default (and what actually took
      // effect pre-fix, since these options were previously silently
      // ignored at the top level).
      background: '#fff',
      theme_color: config.colors ? config.colors.primary : '#fff',
      // favicon app title (see https://github.com/haydenbleasel/favicons#usage)
      appName: config.title,
      appDescription: config.meta.description,
    },
  });
}

function getAllFaviconPlugins() {
  return getAllConfigs().map(faviconPluginFromConfig);
}

export const themeEntries = getAllThemeEntries();
export const faviconPlugins = getAllFaviconPlugins();
