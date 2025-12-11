/* eslint-disable react/prop-types */
import React, { useMemo, useState, createContext, useContext } from 'react';

const FilterContext = createContext();

const DEFAULT_FILTERS = {
  validityPeriod: 'ALL',
};

const FilterContextProvider = ({ children }) => {
  const [selectedFilters, setSelectedFilters] = useState(DEFAULT_FILTERS);

  const setFilter = (key, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    setSelectedFilters(DEFAULT_FILTERS);
  };

  const value = useMemo(
    () => ({
      selectedFilters,
      setFilter,
      resetFilters,
      DEFAULT_FILTERS,
    }),
    [selectedFilters],
  );
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
};

const useFilterContext = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error(
      'useFilterContext must be used within a FilterContextProvider',
    );
  }
  return context;
};

export { FilterContext, FilterContextProvider, useFilterContext };
