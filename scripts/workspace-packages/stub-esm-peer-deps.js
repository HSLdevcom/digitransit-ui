/* eslint-disable no-underscore-dangle */
// Some `@hsl-fi/*` packages are ESM-only ("type": "module") and cannot be
// require()'d in Mocha's CommonJS test environment. Others (e.g.
// @hsl-fi/modal, @hsl-fi/hooks at their currently pinned versions) are
// plain CJS and load fine as-is. So we only fall back to a stub when the
// real require() fails, rather than unconditionally replacing every
// `@hsl-fi/*` import - real dependencies should be exercised for real
// wherever they can be.
//
// Node (since v22/v24) attempts synchronous ESM interop for require() of an
// ESM module instead of immediately throwing the classic ERR_REQUIRE_ESM,
// so the failure that actually surfaces can be any error from deeper in
// that ESM module's own dependency graph (e.g. ERR_MODULE_NOT_FOUND from a
// transitive extensionless import) rather than ERR_REQUIRE_ESM itself -
// catch broadly for this one npm scope rather than pattern-matching a
// specific error code. Mirrors the pattern in test/unit/helpers/init.js,
// minimal since workspace-package unit tests just need a failing import to
// resolve to something requireable, not to behave realistically.
const Module = require('module');

const originalLoad = Module._load;
Module._load = function stubHslFiPackagesOnLoadError(request, ...args) {
  if (request.startsWith('@hsl-fi/')) {
    try {
      return originalLoad.apply(this, [request, ...args]);
    } catch (error) {
      return new Proxy(
        function StubComponent() {
          return null;
        },
        {
          get(target, prop) {
            if (prop === '__esModule') {
              return true;
            }
            if (prop === 'default') {
              return target;
            }
            return function StubComponent() {
              return null;
            };
          },
        },
      );
    }
  }
  return originalLoad.apply(this, [request, ...args]);
};
