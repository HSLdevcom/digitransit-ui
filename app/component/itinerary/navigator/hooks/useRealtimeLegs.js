/* eslint-disable no-param-reassign */
import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchQuery } from 'react-relay';
import { updateLatestNavigatorItineraryParams } from '../../../../store/localStorage';
import { legTime } from '../../../../util/legUtils';
import { legQuery } from '../../queries/LegQuery';
import { getRemainingTraversal } from '../NaviUtils';
import useLegState from './useLegState';
import {
  fakeDelay,
  getLegsOfInterest,
  matchLegEnds,
  nextTransitIndex,
  shiftLegs,
  shiftLegsByGeolocation,
} from './utils/realtimeLegUtils';

const GEOLOCATED_LEGS = true;

const useRealtimeLegs = (
  relayEnvironment,
  initialLegs,
  position,
  vehicles,
  updateLegs,
  forceStartAt,
  simulateTransferProblem,
) => {
  const [{ origin, time, realTimeLegs }, setRealTimeLegs] =
    useLegState(initialLegs); // time = time published to hook users
  const [hookTime, setHookTime] = useState(Date.now()); // internal time to drive leg updates
  const [loading, setLoading] = useState(true);
  const simCounter = useRef(0);

  const queryAndMapRealtimeLegs = useCallback(
    async (legs, now) => {
      if (!legs.length) {
        return {};
      }

      const legQueries = legs
        .filter(leg => leg.transitLeg && legTime(leg.end) > now)
        .map(leg =>
          fetchQuery(
            relayEnvironment,
            legQuery,
            { id: leg.legId },
            { force: true },
          ).toPromise(),
        );
      const responses = await Promise.all(legQueries);
      return responses.reduce(
        (map, response) => ({ ...map, [response.leg.legId]: response.leg }),
        {},
      );
    },
    [relayEnvironment],
  );

  useEffect(() => {
    updateLegs?.(realTimeLegs);
  }, [realTimeLegs]);

  const fetchAndSetRealtimeLegs = async () => {
    const now = Date.now();
    const rtLegMap = await queryAndMapRealtimeLegs(realTimeLegs, now).catch(
      err =>
        // eslint-disable-next-line no-console
        console.error('Failed to query and map real time legs', err),
    );

    let newRtLegs;
    setRealTimeLegs(prev => {
      // Maps previous legs with fresh real time transit legs. If transit leg start or end time is in the past according
      // to previous state, the time is marked as frozen to stabilize the current navigation state.
      // rtLegMap does not contain legs that have ended in the past as they've been filtered before updates are queried
      newRtLegs = prev.realTimeLegs.map(leg => {
        const l = cloneDeep(leg);
        const rtLeg =
          l.legId && rtLegMap?.[l.legId] ? { ...rtLegMap[l.legId] } : null;
        if (rtLeg) {
          // If start is frozen, the property is deleted to prevent it from affecting any views
          if (l.freezeStart) {
            delete rtLeg.start;
          }
          return {
            ...l,
            ...rtLeg, // delete above prevent this from overwriting a previous, frozen state
            to: {
              ...l.to,
              vehicleRentalStation: rtLeg.to.vehicleRentalStation,
            },
          };
        }
        // Non-transit legs are kept unfrozen for now to allow them to be scaled or shifted
        return l;
      });

      // fake transfer problem by delaying 1st transfer leg and then back to normal
      if (simulateTransferProblem) {
        fakeDelay(newRtLegs, simCounter.current);
        simCounter.current += 1;
      }

      // Shift unfrozen, non-transit-legs to match possibly changed transit legs
      matchLegEnds(newRtLegs, now);

      if (GEOLOCATED_LEGS) {
        shiftLegsByGeolocation(newRtLegs, now, vehicles, position, origin);
        // transit legs may have changed, shift again
        matchLegEnds(newRtLegs, now);
      }

      // Freezes any leg.start|end in the past
      newRtLegs.forEach(l => {
        l.freezeStart = l.freezeStart || legTime(l.start) <= now;
        l.freezeEnd = l.freezeEnd || legTime(l.end) <= now;
      });
      return { ...prev, time: now, realTimeLegs: newRtLegs };
    });
  };

  const startItinerary = startTimeInMS => {
    if (startTimeInMS < legTime(realTimeLegs[0].start)) {
      setRealTimeLegs(prev => {
        const firstLeg = prev.realTimeLegs[0];

        if (firstLeg.transitLeg) {
          firstLeg.forceStart = true;
          return { ...prev, time: startTimeInMS };
        }
        const adjustment = startTimeInMS - legTime(realTimeLegs[0].start);
        const lastShifted = nextTransitIndex(realTimeLegs, 0) - 1;
        shiftLegs(realTimeLegs, 0, lastShifted, adjustment);
        // must freeze initial start time, otherwise transit
        // leg matching might move start time again to future
        // allow other times to move so that geolocation can
        // modify the estimates
        realTimeLegs[0].freezeStart = true;
        updateLatestNavigatorItineraryParams({ forceStartAt: startTimeInMS });

        return { ...prev, time: startTimeInMS };
      });
      updateLatestNavigatorItineraryParams({ forceStartAt: startTimeInMS });
    }
  };

  useEffect(() => {
    fetchAndSetRealtimeLegs();
  }, [hookTime]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHookTime(Date.now());
    }, 10000);

    if (forceStartAt) {
      startItinerary(forceStartAt);
    }
    setLoading(false);
    return () => clearInterval(interval);
  }, []);

  const { firstLeg, lastLeg, currentLeg, nextLeg, previousLeg } =
    getLegsOfInterest(realTimeLegs, time);

  const tailLength = currentLeg
    ? getRemainingTraversal(currentLeg, position, origin, time) *
      currentLeg.distance
    : 0;

  return {
    realTimeLegs,
    time,
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
