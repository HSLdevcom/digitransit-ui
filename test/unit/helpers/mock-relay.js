// The one place where Relay is stubbed for the app unit tests. vitest.setup.js
// registers these stubs for both 'react-relay' and 'react-relay/hooks', so
// every import form of a hook resolves to the same function. The stubs read
// their behaviour from this module's state at call time. The state is reset
// after every test, so tests configure Relay only through `relayMock`:
//
//   relayMock.query(TripLinkQuery, { trip: {...} }); // useLazyLoadQuery result
//   relayMock.query(null, relayMock.pending);        // suspend every query
//   relayMock.fetch(null, response);                 // fetchQuery(...).toPromise()
//   relayMock.fetch(null, variables => promise);     // resolve it from the test
//
// A match is a query node, a query name, or null for any query; the latest
// matching registration wins. A result is a value or a function of
// (variables, query). Queries without a registration use the defaults:
// useLazyLoadQuery returns {} and fetchQuery never resolves.
// useFragment and useRefetchableFragment return the data given to them.

const queryHandlers = [];
const fetchHandlers = [];
const fetchCalls = [];

const pending = Symbol('pending');

const refetch = vi.fn();

const matches = (match, query) =>
  match === null || match === query || match === query?.params?.name;

const findHandler = (handlers, query) =>
  handlers.findLast(handler => matches(handler.match, query));

const resolveResult = (result, variables, query) =>
  typeof result === 'function' ? result(variables, query) : result;

const neverResolves = () => new Promise(() => {});

const stubs = {
  useFragment: (_fragment, fragmentRef) => fragmentRef,

  useRefetchableFragment: (_fragment, fragmentRef) => [fragmentRef, refetch],

  useLazyLoadQuery: (query, variables) => {
    const handler = findHandler(queryHandlers, query);
    if (!handler) {
      return {};
    }
    if (handler.result === pending) {
      throw neverResolves();
    }
    return resolveResult(handler.result, variables, query);
  },

  fetchQuery: (_environment, query, variables, options) => {
    fetchCalls.push({ query, variables, options });
    const handler = findHandler(fetchHandlers, query);
    return {
      toPromise: () => {
        if (!handler || handler.result === pending) {
          return neverResolves();
        }
        try {
          return Promise.resolve(
            resolveResult(handler.result, variables, query),
          );
        } catch (error) {
          return Promise.reject(error);
        }
      },
    };
  },
};

export const relayMock = {
  pending,
  refetch,
  query: (match, result) => queryHandlers.push({ match, result }),
  fetch: (match, result) => fetchHandlers.push({ match, result }),
  // fetchQuery calls of the current test: { query, variables, options }
  fetchCalls,
  reset: () => {
    queryHandlers.length = 0;
    fetchHandlers.length = 0;
    fetchCalls.length = 0;
    refetch.mockClear();
  },
};

// Environment given to components through ReactRelayContext. Query results
// come from the stubs above, so it never has to execute anything.
const noop = () => {};
export const mockRelayEnvironment = {
  check: noop,
  lookup: noop,
  retain: noop,
  execute: noop,
  subscribe: noop,
};

// Overrides the real react-relay exports, including the default export that
// some call sites use.
export const withRelayStubs = actual => ({
  ...actual,
  ...actual.default,
  ...stubs,
  default: { ...actual.default, ...stubs },
});
