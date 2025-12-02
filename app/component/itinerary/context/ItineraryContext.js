/* eslint-disable react/prop-types, no-unused-vars, no-console */
import React, { createContext, useContext, useMemo } from 'react';
import useItineraryReducer from './useItineraryReducer';

const ItineraryContext = createContext();

const ItineraryContextProvider = ({ children }) => {
  const [{ itinerary, params }, dispatch] = useItineraryReducer();

  const contextValue = useMemo(
    () => ({
      itinerary,
      params,
      dispatch,
    }),
    [itinerary, params],
  );

  return (
    <ItineraryContext.Provider value={contextValue}>
      {children}
    </ItineraryContext.Provider>
  );
};

const useItineraryContext = () => {
  const context = useContext(ItineraryContext);
  if (!context) {
    throw new Error(
      'useItineraryContext must be used within a ItineraryContextProvider',
    );
  }
  return context;
};

export { ItineraryContext, ItineraryContextProvider, useItineraryContext };
