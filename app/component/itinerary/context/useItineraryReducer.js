import cloneDeep from 'lodash/cloneDeep';
import polyUtil from 'polyline-encoded';
import { useReducer } from 'react';
import { GeodeticToEnu } from '../../../util/geo-utils';
import { legTime } from '../../../util/legUtils';
import {
  getLatestNavigatorItinerary,
  setLatestNavigatorItinerary,
  updateLatestNavigatorItineraryParams,
} from '../../../store/localStorage';

const REDUCER_ACTION_TYPES = {
  INIT_NAVIGATOR_ITINERARY: 'INIT_NAVIGATOR_ITINERARY',
  SET_ITINERARY_LEGS_AND_PARAMS: 'SET_ITINERARY_LEGS_AND_PARAMS',
  SET_ITINERARY_LEGS_AND_UPDATE_PARAMS: 'SET_ITINERARY_LEGS_AND_UPDATE_PARAMS',
};

const initializeItinerary = ({ itinerary, params }) => {
  const time = Date.now();
  return {
    itinerary: {
      ...itinerary,
      legs: itinerary.legs.map(leg => {
        const geometry = polyUtil.decode(leg.legGeometry.points);
        const clonedLeg = cloneDeep(leg);
        clonedLeg.geometry = geometry.map(([lat, lon]) =>
          GeodeticToEnu(lat, lon, params.origin),
        );
        clonedLeg.freezeStart = legTime(clonedLeg.start) <= time;
        clonedLeg.freezeEnd = legTime(clonedLeg.end) <= time;
        clonedLeg.originalStart = cloneDeep(leg.start);
        clonedLeg.originalEnd = cloneDeep(leg.end);
        return clonedLeg;
      }),
    },
    params,
  };
};

const itineraryReducer = (state, { type, payload }) => {
  switch (type) {
    case REDUCER_ACTION_TYPES.INIT_NAVIGATOR_ITINERARY: {
      const itinerary = initializeItinerary(state);
      return itinerary;
    }
    case REDUCER_ACTION_TYPES.SET_ITINERARY_LEGS_AND_PARAMS: {
      const itinerary = initializeItinerary(payload);
      setLatestNavigatorItinerary(itinerary);
      return itinerary;
    }
    case REDUCER_ACTION_TYPES.SET_ITINERARY_LEGS_AND_UPDATE_PARAMS:
      updateLatestNavigatorItineraryParams(payload.params);
      return {
        ...state,
        itinerary: { ...state.itinerary, legs: payload.legs },
        params: { ...state.params, ...payload.params },
      };
    default:
      return state;
  }
};

const useItineraryReducer = () => {
  const [itinerary, dispatch] = useReducer(
    itineraryReducer,
    getLatestNavigatorItinerary(),
  );

  return [itinerary, dispatch];
};

export { useItineraryReducer as default, REDUCER_ACTION_TYPES };
