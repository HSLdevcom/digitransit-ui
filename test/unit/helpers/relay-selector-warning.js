// Components rendered without a real Relay store in the unit env emit a
// harmless RelayModernSelector warning, which the global harness (see
// vitest.setup.js) turns into a thrown error. Call this at the top of a
// describe block to relax only that specific warning so tests can assert
// the component's own behaviour instead.
const alsoAllowed = [
  'RelayModernSelector',
  // see vitest.setup.js's allowedDeprecationWarnings for why these are ignored
  'uses the legacy childContextTypes API',
  'uses the legacy contextTypes API',
  'Support for defaultProps will be removed from',
  'contains the string ref',
];

export function ignoreRelayModernSelectorWarning() {
  let savedConsoleError;
  beforeEach(() => {
    // eslint-disable-next-line no-console
    savedConsoleError = console.error;
    // eslint-disable-next-line no-console
    console.error = warning => {
      if (alsoAllowed.some(allowed => String(warning).includes(allowed))) {
        return;
      }
      throw new Error(warning);
    };
  });
  afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = savedConsoleError;
  });
}
