import React, { createContext, useContext } from 'react';
import { PropTypes } from 'prop-types';
import { configShape } from '../util/shapes';

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

ConfigProvider.propTypes = {
  value: configShape.isRequired,
  children: PropTypes.node.isRequired,
};
