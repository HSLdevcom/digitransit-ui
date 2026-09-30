import React, { createContext, useContext } from 'react';
import { PropTypes } from 'prop-types';
import hoistNonReactStatics from 'hoist-non-react-statics';
import { configShape } from '../../utils/client/shapes';

const ConfigContext = createContext();

export function ConfigProvider({ value, children }) {
  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfigContext must be used within a ConfigProvider');
  }
  return context;
}

/**
 * HOC to pass ConfigContext to Class components
 */
export function withConfigContext(Component) {
  function WithConfigContext(props) {
    return (
      <ConfigContext.Consumer>
        {config => {
          if (!config) {
            throw new Error(
              'withConfigContext must be used within a ConfigProvider',
            );
          }
          return <Component {...props} config={config} />;
        }}
      </ConfigContext.Consumer>
    );
  }
  WithConfigContext.displayName = `WithConfigContext(${
    Component.displayName || Component.name || 'Component'
  })`;
  hoistNonReactStatics(WithConfigContext, Component);
  return WithConfigContext;
}

ConfigProvider.propTypes = {
  value: configShape.isRequired,
  children: PropTypes.node.isRequired,
};
