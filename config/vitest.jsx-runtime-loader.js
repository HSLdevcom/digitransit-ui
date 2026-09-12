import { register } from 'node:module';

// @hsl-fi/dialog (pulled in by digitransit-component-dialog-modal, and
// transitively by MobileView.js in several other digitransit-component
// packages) depends on @radix-ui packages whose real .mjs ESM build
// statically imports the extensionless `react/jsx-runtime` subpath. This
// React version ships that file as `jsx-runtime.js` with no "exports" map
// entry for the extensionless form, so Node's own strict ESM resolver
// can't find it - and since these are genuine ESM dependencies, Node
// handles their resolution directly, bypassing Vite's resolver/aliases
// entirely. A Node module customization hook is the only layer that can
// intercept this.
register(import.meta.url);

const CSS_RE = /\.s?css$/;

export async function resolve(specifier, context, nextResolve) {
  if (
    specifier === 'react/jsx-runtime' ||
    specifier === 'react/jsx-dev-runtime'
  ) {
    return nextResolve(`${specifier}.js`, context);
  }
  return nextResolve(specifier, context);
}

// Same reasoning as the CSS-stubbing everywhere else in this migration (see
// vitest.config.js's `css: false`): nothing under this dependency subtree
// asserts on actual styling, and Node has no CSS loader of its own.
export async function load(url, context, nextLoad) {
  if (CSS_RE.test(url)) {
    return {
      format: 'module',
      shortCircuit: true,
      source: 'export default {};',
    };
  }
  return nextLoad(url, context);
}
