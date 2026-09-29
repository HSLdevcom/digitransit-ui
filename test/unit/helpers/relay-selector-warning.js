// Components rendered without a real Relay store in the unit env emit a
// harmless RelayModernSelector warning, which the global harness (see
// vitest.setup.js) turns into a thrown error. Call this at the top of a
// describe block to relax only that specific warning so tests can assert
// the component's own behaviour instead.
export function ignoreRelayModernSelectorWarning() {
  let savedConsoleError;
  beforeEach(() => {
    // eslint-disable-next-line no-console
    savedConsoleError = console.error;
    // eslint-disable-next-line no-console
    console.error = warning => {
      if (String(warning).includes('RelayModernSelector')) {
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
