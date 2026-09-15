import trimEnd from 'lodash/trimEnd';

/**
 * The default icon sizes to generate manifest urls for.
 */
export const ICON_SIZES = [36, 48, 72, 96, 144, 192, 256, 384, 512];

export const getIconUrl = (config, protocol, host, size) => {
  const iconHost = config.URL.ASSET_URL || `${protocol}//${host}`;
  const iconPath = trimEnd(config.iconPath || 'icons', '/');
  return `${iconHost}/${iconPath}/android-chrome-${size}x${size}.png`;
};

export const generateManifestIcons = (config, protocol, host) =>
  ICON_SIZES.map(size => ({
    sizes: `${size}x${size}`,
    src: getIconUrl(config, protocol, host, size),
    type: 'image/png',
  }));

export const generateManifest = (
  config,
  { host, pathname, protocol },
  { title, description } = {},
) => ({
  background_color: config.colors.primary,
  description: description || config.meta.description,
  dir: 'auto',
  display: 'standalone',
  icons: generateManifestIcons(config, protocol, host),
  name: title || config.title,
  orientation: 'portrait',
  short_name: title || config.title,
  start_url: `${protocol}//${host}${pathname}?homescreen=1`,
  theme_color: config.colors.primary,
});

/**
 * Creates a new blob file with the given json data. The data will be
 * stringified.
 *
 * @param {*} json The json data to serialize into a blob file.
 */
export const jsonToBlob = json =>
  new Blob([JSON.stringify(json)], {
    type: 'application/json',
  });

/**
 * Generates a manifest blob for the current url with the given configuration,
 * title and description. This works only on the client side.
 *
 * @param {*} config The configuration for the software installation.
 * @param {{ host: string, pathname: string, protocol: string}} location The current location properties.
 * @param {{ title: string, description: string, ignorePathname: boolean }} params Optional parameters.
 */
export const generateManifestUrl = (
  config,
  { host, pathname, protocol },
  { title, description, ignorePathname } = {},
) =>
  URL.createObjectURL(
    jsonToBlob(
      generateManifest(
        config,
        { host, pathname: ignorePathname ? '/' : pathname, protocol },
        { title, description },
      ),
    ),
  );
