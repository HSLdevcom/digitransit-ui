import { useCallback, useEffect, useState } from 'react';
import { legTime } from '../../../../util/legUtils';
import { useItineraryContext } from '../../context/ItineraryContext';
import { REDUCER_ACTION_TYPES } from '../../context/useItineraryReducer';
import { getRemainingTraversal } from '../NaviUtils';
import useProcessLegs from './useProcessLegs';
import useQueryRealtimeLegs from './useQueryRealtimeLegs';
import {
  getLegsOfInterest,
  nextTransitIndex,
  shiftLegs,
} from './utils/realtimeLegUtils';

const useRealtimeLegs = (
  relayEnvironment,
  position,
  vehicles,
  simulateTransferProblem,
) => {
  const { itinerary, params, dispatch } = useItineraryContext();
  const [loading, setLoading] = useState(true);

  const queryAndMapRealtimeLegs = useQueryRealtimeLegs(relayEnvironment);

  const processLegs = useProcessLegs(
    simulateTransferProblem,
    position,
    vehicles,
    params.origin,
  );

  const fetchAndSetRealtimeLegs = useCallback(async () => {
    const now = Date.now();
    const rtLegMap = await queryAndMapRealtimeLegs(itinerary.legs, now).catch(
      err =>
        // eslint-disable-next-line no-console
        console.error('Failed to query and map real time legs', err),
    );

    dispatch({
      type: REDUCER_ACTION_TYPES.SET_ITINERARY_LEGS_AND_UPDATE_PARAMS,
      payload: {
        legs: processLegs(itinerary.legs, rtLegMap, now),
        params: { updatedAt: now },
      },
    });
  }, [processLegs]);

  const startItinerary = startTimeInMS => {
    if (startTimeInMS < legTime(itinerary.legs[0].start)) {
      const [firstLeg, ...rest] = itinerary.legs;
      if (firstLeg.transitLeg) {
        firstLeg.forceStart = true;
      } else {
        const adjustment = startTimeInMS - legTime(firstLeg.start);
        const lastShifted = nextTransitIndex(itinerary.legs, 0) - 1;
        shiftLegs(itinerary.legs, 0, lastShifted, adjustment);
        // must freeze initial start time, otherwise transit
        // leg matching might move start time again to future
        // allow other times to move so that geolocation can
        // modify the estimates
        firstLeg.freezeStart = true;
      }
      dispatch({
        type: REDUCER_ACTION_TYPES.SET_ITINERARY_LEGS_AND_UPDATE_PARAMS,
        payload: {
          legs: [firstLeg, ...rest],
          params: { updatedAt: startTimeInMS, forceStartAt: startTimeInMS },
        },
      });
    }
  };

  useEffect(() => {
    if (params.forceStartAt) {
      startItinerary(params.forceStartAt);
    }
    setLoading(false);

    const id = setInterval(() => fetchAndSetRealtimeLegs(), 10000);
    return () => clearInterval(id);
  }, [fetchAndSetRealtimeLegs]);

  const { firstLeg, lastLeg, currentLeg, nextLeg, previousLeg } =
    getLegsOfInterest(itinerary.legs, params.updatedAt);

  const tailLength = currentLeg
    ? getRemainingTraversal(
        currentLeg,
        position,
        params.origin,
        params.updatedAt,
      ) * currentLeg.distance
    : 0;

  return {
    tailLength,
    firstLeg,
    lastLeg,
    previousLeg,
    currentLeg,
    nextLeg,
    startItinerary,
    loading,
  };
};

export { useRealtimeLegs };
