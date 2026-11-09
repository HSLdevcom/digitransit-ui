import babel, { defineRolldownBabelPreset } from '@rolldown/plugin-babel';

/**
 * Compiles Relay `graphql` tagged templates, which Oxc can't, with Babel's
 * relay plugin. Only files containing one go through Babel.
 *
 * @returns {Promise<import('vite').Plugin>}
 */
export default function relay() {
  return babel({
    presets: [
      defineRolldownBabelPreset({
        preset: { plugins: ['relay'] },
        rolldown: { filter: { code: 'graphql`' } },
      }),
    ],
  });
}
