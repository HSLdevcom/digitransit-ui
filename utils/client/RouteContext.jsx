/* eslint-disable react/prop-types */
import { useMemo, createContext, useContext } from 'react';

const RouteContext = createContext(null);

const useRoute = () => {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouteContext.Provider');
  }
  return context;
};

const RouteContextProvider = ({ value, children }) => {
  const memoizedValue = useMemo(
    () => value,
    [value.match, value.props, value.error],
  );
  return (
    <RouteContext.Provider value={memoizedValue}>
      {children}
    </RouteContext.Provider>
  );
};

const withRouteContext = render => args => {
  const { Component, props, error, match } = args;
  if (Component && (props || error)) {
    const value = { match, props, error };
    return (
      <RouteContextProvider value={value}>
        {render ? (
          render(args)
        ) : (
          <Component {...props} match={match} error={error} />
        )}
      </RouteContextProvider>
    );
  }
  return null;
};

export { RouteContext, useRoute, withRouteContext };
