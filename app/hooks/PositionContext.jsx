import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import PropTypes from 'prop-types';
import {
  getGeolocationState,
  setGeolocationState,
} from '../../utils/client/localStorage';
import { useConfigContext } from './ConfigContext';
import { createPositionService } from '../data/PositionService';
import searchContext from '../data/SearchContext';

export const POSITION_STATUS = {
  NO_LOCATION: 'no-location',
  SEARCHING_LOCATION: 'searching-location',
  GEOLOCATION_PROMPT: 'prompt',
  FOUND_LOCATION: 'found-location',
  FOUND_ADDRESS: 'found-address',
  GEOLOCATION_DENIED: 'geolocation-denied',
  GEOLOCATION_TIMEOUT: 'geolocation-timeout',
  GEOLOCATION_WATCH_TIMEOUT: 'geolocation-watch-timeout',
  GEOLOCATION_NOT_SUPPORTED: 'geolocation-not-supported',
};

export const REVERSE_GEOCODING_STATUS = {
  READY: 'reverse-geocoding-ready',
  IN_PROGRESS: 'reverse-geocoding-in-progress',
};

function createLocationState(fields) {
  const hasLocation =
    (fields.status === POSITION_STATUS.FOUND_ADDRESS ||
      fields.status === POSITION_STATUS.FOUND_LOCATION) &&
    (fields.lat !== 0 || fields.lon !== 0);
  return {
    type: 'CurrentLocation',
    lat: fields.lat,
    lon: fields.lon,
    address: fields.address,
    gid: fields.gid,
    name: fields.name,
    layer: fields.layer,
    status: fields.status,
    locationCount: fields.locationCount,
    watchId: fields.watchId,
    hasLocation,
    isLocationingInProgress:
      fields.status === POSITION_STATUS.SEARCHING_LOCATION,
    isReverseGeocodingInProgress:
      fields.reverseGeocodingStatus === REVERSE_GEOCODING_STATUS.IN_PROGRESS,
    locationingFailed:
      fields.status === POSITION_STATUS.GEOLOCATION_DENIED ||
      fields.status === POSITION_STATUS.GEOLOCATION_TIMEOUT ||
      fields.status === POSITION_STATUS.GEOLOCATION_WATCH_TIMEOUT ||
      fields.status === POSITION_STATUS.GEOLOCATION_NOT_SUPPORTED,
  };
}

export function createInitialPositionState() {
  const fields = {
    lat: 0,
    lon: 0,
    heading: null,
    address: undefined,
    gid: undefined,
    name: undefined,
    layer: undefined,
    status: POSITION_STATUS.NO_LOCATION,
    reverseGeocodingStatus: undefined,
    locationCount: 0,
    watchId: undefined,
    savedState: getGeolocationState(),
  };
  return { fields, position: createLocationState(fields) };
}

export function positionReducer(state, action) {
  const fields = { ...state.fields };
  switch (action.type) {
    case 'geolocation-search':
      fields.status = POSITION_STATUS.SEARCHING_LOCATION;
      fields.savedState = 'searching';
      fields.address = undefined;
      break;
    case 'geolocation-not-supported':
      fields.status = POSITION_STATUS.GEOLOCATION_NOT_SUPPORTED;
      fields.savedState = 'failed';
      break;
    case 'geolocation-denied':
      fields.status = POSITION_STATUS.GEOLOCATION_DENIED;
      fields.savedState = 'denied';
      break;
    case 'geolocation-timeout':
      fields.status = POSITION_STATUS.GEOLOCATION_TIMEOUT;
      fields.savedState = 'timeout';
      break;
    case 'geolocation-watch-timeout':
      fields.status = POSITION_STATUS.GEOLOCATION_WATCH_TIMEOUT;
      fields.savedState = 'timeout';
      break;
    case 'geolocation-prompt':
      fields.status = POSITION_STATUS.GEOLOCATION_PROMPT;
      fields.savedState = 'prompt';
      break;
    case 'geolocation-found': {
      const { location } = action;
      fields.savedState = 'granted';
      if (
        location &&
        location.disableFiltering !== true &&
        Math.abs(fields.lat - location.lat) < 0.001 &&
        Math.abs(fields.lon - location.lon) < 0.001
      ) {
        fields.lat = (fields.lat + location.lat) / 2;
        fields.lon = (fields.lon + location.lon) / 2;
      } else {
        fields.lat = location.lat;
        fields.lon = location.lon;
      }
      fields.heading = location.heading ? location.heading : fields.heading;
      fields.status = POSITION_STATUS.FOUND_LOCATION;
      fields.locationCount += 1;
      break;
    }
    case 'address-found': {
      const { location } = action;
      fields.reverseGeocodingStatus = REVERSE_GEOCODING_STATUS.READY;
      // a late reverse geocoding result must not override a newer status
      // such as a timeout, or attach an address to a new search
      if (
        fields.status !== POSITION_STATUS.FOUND_LOCATION &&
        fields.status !== POSITION_STATUS.FOUND_ADDRESS
      ) {
        break;
      }
      if (location.address) {
        fields.address = location.city
          ? `${location.address}, ${location.city}`
          : location.address;
      } else if (location.city) {
        fields.address = location.city;
      } else {
        fields.address = '';
      }
      fields.gid = location.gid;
      fields.name = location.name;
      fields.layer = location.layer;
      fields.status = POSITION_STATUS.FOUND_ADDRESS;
      break;
    }
    case 'watch-started':
      fields.watchId = action.watchId;
      break;
    case 'watch-stopped':
      fields.watchId = undefined;
      break;
    case 'reverse-geocoding-started':
      fields.reverseGeocodingStatus = REVERSE_GEOCODING_STATUS.IN_PROGRESS;
      break;
    default:
      return state;
  }
  if (Object.keys(fields).every(key => fields[key] === state.fields[key])) {
    return state;
  }
  return { fields, position: createLocationState(fields) };
}

const PositionContext = createContext(null);
const PositionActionsContext = createContext(null);

export function PositionProvider({ children = null }) {
  const config = useConfigContext();
  const [state, dispatch] = useReducer(
    positionReducer,
    undefined,
    createInitialPositionState,
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    if (getGeolocationState() !== state.fields.savedState) {
      setGeolocationState(state.fields.savedState);
    }
  }, [state.fields.savedState]);

  const service = useMemo(
    () =>
      createPositionService(config, dispatch, () => stateRef.current.position),
    [],
  );
  const actions = useMemo(
    () => ({
      startLocationWatch: service.startLocationWatch,
      stopLocationWatch: service.stopLocationWatch,
      checkPositioningPermission: service.checkPositioningPermission,
      showGeolocationDeniedMessage: service.showGeolocationDeniedMessage,
    }),
    [],
  );

  useEffect(() => {
    service.activate();
    searchContext.setPositionGetter(() => stateRef.current.position);
    return () => {
      searchContext.setPositionGetter(null);
      service.dispose();
    };
  }, []);

  return (
    <PositionActionsContext.Provider value={actions}>
      <PositionContext.Provider value={state.position}>
        {children}
      </PositionContext.Provider>
    </PositionActionsContext.Provider>
  );
}

PositionProvider.propTypes = {
  children: PropTypes.node,
};

export function usePosition() {
  const position = useContext(PositionContext);
  if (!position) {
    throw new Error('Position hooks must be used within a PositionProvider');
  }
  return position;
}

export function usePositionActions() {
  const actions = useContext(PositionActionsContext);
  if (!actions) {
    throw new Error('Position hooks must be used within a PositionProvider');
  }
  return actions;
}
