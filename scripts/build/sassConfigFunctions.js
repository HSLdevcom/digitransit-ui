import get from 'lodash/get.js';
import * as sass from 'sass';

import { getNamedConfiguration } from '../../server/configs/config.js';

// Sass functions for a theme's tokens.scss: config('colors.primary') reads
// that value from the theme's config, so it's only defined in one place.
export default function sassConfigFunctions(theme) {
  const config = getNamedConfiguration(theme);
  return {
    'config($path)': ([path]) => {
      const { text } = path.assertString('path');
      const value = get(config, text);
      if (value === undefined) {
        throw new Error(`config('${text}') is not set for ${theme}`);
      }
      return new sass.SassString(String(value), { quotes: false });
    },
  };
}
