import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import PropTypes from 'prop-types';

const initialState = {
  origin: {},
  destination: {},
  viaPoints: [],
};

function locationReducer(state, action) {
  switch (action.type) {
    case 'SET_ORIGIN':
      return { ...state, origin: action.origin };
    case 'SET_DESTINATION':
      return { ...state, destination: action.destination };
    case 'SET_VIA_POINTS':
      return { ...state, viaPoints: [...action.viaPoints] };
    case 'ADD_VIA_POINT':
      return { ...state, viaPoints: [...state.viaPoints, action.point] };
    case 'DELETE_VIA_POINT':
      return {
        ...state,
        viaPoints: state.viaPoints.filter(
          p => p.lat !== action.point.lat || p.lon !== action.point.lon,
        ),
      };
    default:
      return state;
  }
}

const ItineraryLocationContext = createContext({
  origin: {},
  destination: {},
  viaPoints: [],
  actions: {
    setOrigin: () => {},
    setDestination: () => {},
    setViaPoints: () => {},
    addViaPoint: () => {},
    deleteViaPoint: () => {},
  },
});

export const useOrigin = () => useContext(ItineraryLocationContext).origin;

export const useDestination = () =>
  useContext(ItineraryLocationContext).destination;

export const useViaPoints = () =>
  useContext(ItineraryLocationContext).viaPoints;

export const useItineraryLocationActions = () =>
  useContext(ItineraryLocationContext).actions;

/**
 * Provides the itinerary search's geographic endpoints (origin, destination
 * and via points), replacing the old Fluxible OriginStore, DestinationStore
 * and ViaPointStore. Other itinerary search parameters (time, modes, etc.)
 * are intentionally out of scope here and live in their own contexts/hooks.
 */
export function ItineraryLocationProvider({ children = null }) {
  const [state, dispatch] = useReducer(locationReducer, initialState);

  const setOrigin = useCallback(
    origin => dispatch({ type: 'SET_ORIGIN', origin }),
    [],
  );

  const setDestination = useCallback(
    destination => dispatch({ type: 'SET_DESTINATION', destination }),
    [],
  );

  const setViaPoints = useCallback(
    viaPoints => dispatch({ type: 'SET_VIA_POINTS', viaPoints }),
    [],
  );

  const addViaPoint = useCallback(
    point => dispatch({ type: 'ADD_VIA_POINT', point }),
    [],
  );

  const deleteViaPoint = useCallback(
    point => dispatch({ type: 'DELETE_VIA_POINT', point }),
    [],
  );

  const actions = useMemo(
    () => ({
      setOrigin,
      setDestination,
      setViaPoints,
      addViaPoint,
      deleteViaPoint,
    }),
    [setOrigin, setDestination, setViaPoints, addViaPoint, deleteViaPoint],
  );

  const value = useMemo(() => ({ ...state, actions }), [state, actions]);

  return (
    <ItineraryLocationContext.Provider value={value}>
      {children}
    </ItineraryLocationContext.Provider>
  );
}

ItineraryLocationProvider.propTypes = {
  children: PropTypes.node,
};
