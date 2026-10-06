import { useCallback, useEffect, useRef, useState } from 'react';
import { legTime } from '../../../../../utils/client/legUtils';
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

  // The poll must always work on the latest legs, not on the legs of the
  // render in which the callback happened to be created.
  const legsRef = useRef();
  legsRef.current = itinerary.legs;
  const mountedRef = useRef(false);
  const fetchingRef = useRef(false);

  const fetchAndSetRealtimeLegs = useCallback(async () => {
    if (fetchingRef.current) {
      // previous poll is still in flight; do not let polls overlap
      return;
    }
    fetchingRef.current = true;
    try {
      const now = Date.now();
      const rtLegMap = await queryAndMapRealtimeLegs(
        legsRef.current,
        now,
      ).catch(err =>
        // eslint-disable-next-line no-console
        console.error('Failed to query and map real time legs', err),
      );

      if (!mountedRef.current) {
        return;
      }
      // legs may have changed while waiting for the query, so read them again
      dispatch({
        type: REDUCER_ACTION_TYPES.SET_ITINERARY_LEGS_AND_UPDATE_PARAMS,
        payload: {
          legs: processLegs(legsRef.current, rtLegMap, now),
          params: { updatedAt: now },
        },
      });
    } finally {
      fetchingRef.current = false;
    }
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
          params: { updatedAt: startTimeInMS },
        },
      });
    }
  };

  // fetchAndSetRealtimeLegs is recreated whenever processLegs changes
  // identity (e.g. on every real-time vehicle message, since processLegs
  // depends on `vehicles`). Keep the latest version in a ref instead of the
  // interval's dependency array, so the 10 s poll is a stable heartbeat that
  // is never torn down/restarted - otherwise a steady stream of vehicle
  // updates can prevent the interval from ever completing a full 10 s
  // period, stalling real-time leg updates.
  const fetchAndSetRealtimeLegsRef = useRef(fetchAndSetRealtimeLegs);
  useEffect(() => {
    fetchAndSetRealtimeLegsRef.current = fetchAndSetRealtimeLegs;
  }, [fetchAndSetRealtimeLegs]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(false);
    const id = setInterval(() => fetchAndSetRealtimeLegsRef.current(), 10000);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, []);

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
