/* eslint-disable no-param-reassign */
import { useCallback, useEffect, useState, useRef } from 'react';
import { fetchQuery } from 'react-relay';
import { updateLatestNavigatorItineraryParams } from '../../../../store/localStorage';
import { legTime } from '../../../../util/legUtils';
import { legQuery } from '../../queries/LegQuery';
import { getRemainingTraversal, validateTransitLeg } from '../NaviUtils';
import useInitialLegState from './useInitialLegState';
import {
  getLegsOfInterest,
  matchLegEnds,
  nextTransitIndex,
  shiftLeg,
  shiftLegs,
} from './utils/realtimeLegUtils';

const useRealtimeLegs = (
  relayEnvironment,
  initialLegs,
  position,
  vehicles,
  updateLegs,
  forceStartAt,
  simulateTransferProblem,
) => {
  const [{ origin, time, realTimeLegs }, setTimeAndRealTimeLegs] =
    useInitialLegState(initialLegs);
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

  const fetchAndSetRealtimeLegs = useCallback(async () => {
    const now = Date.now();
    const rtLegMap = await queryAndMapRealtimeLegs(realTimeLegs, now).catch(
      err =>
        // eslint-disable-next-line no-console
        console.error('Failed to query and map real time legs', err),
    );

    let newRtLegs;
    setTimeAndRealTimeLegs(prev => {
      // Maps previous legs with fresh real time transit legs. If transit leg start or end time is in the past according
      // to previous state, the time is marked as frozen to stabilize the current navigation state.
      // rtLegMap does not contain legs that have ended in the past as they've been filtered before updates are queried
      newRtLegs = prev.realTimeLegs.map(l => {
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
        const rtLeg = newRtLegs.find(tl => tl.transitLeg);
        switch (Math.floor(simCounter.current / 2)) {
          case 1:
            shiftLeg(rtLeg, 90000);
            break;
          case 2:
            shiftLeg(rtLeg, 180000);
            break;
          case 3:
            shiftLeg(rtLeg, 300000);
            break;
          case 4:
            shiftLeg(rtLeg, 180000);
            break;
          case 5:
            shiftLeg(rtLeg, 90000);
            break;
          default:
            break;
        }
      }
      simCounter.current += 1;

      // Shift unfrozen, non-transit-legs to match possibly changed transit legs
      matchLegEnds(newRtLegs, now);

      // Freezes any leg.start|end in the past
      newRtLegs.forEach(l => {
        l.freezeStart = l.freezeStart || legTime(l.start) <= now;
        l.freezeEnd = l.freezeEnd || legTime(l.end) <= now;
      });
      return { ...prev, time: now, realTimeLegs: newRtLegs };
    });
    updateLegs?.(newRtLegs);
  }, [queryAndMapRealtimeLegs, realTimeLegs, updateLegs]);

  const startItinerary = startTimeInMS => {
    if (startTimeInMS < legTime(realTimeLegs[0].start)) {
      setTimeAndRealTimeLegs(prev => {
        const firstLeg = prev.realTimeLegs[0];

        if (firstLeg.transitLeg) {
          firstLeg.forceStart = true;
          return {
            ...prev,
            time: startTimeInMS,
          };
        }
        const adjustment = startTimeInMS - legTime(realTimeLegs[0].start);
        const lastShifted = nextTransitIndex(realTimeLegs, 0) - 1;
        shiftLegs(realTimeLegs, 0, lastShifted, adjustment);
        for (let i = 0; i <= lastShifted; i++) {
          const leg = realTimeLegs[i];
          leg.freezeStart = true;
          leg.freezeEnd = true;
        }
        updateLatestNavigatorItineraryParams({ forceStartAt: startTimeInMS });

        return {
          ...prev,
          time: startTimeInMS,
          realTimeLegs: prev.realTimeLegs,
        };
      });
      updateLatestNavigatorItineraryParams({ forceStartAt: startTimeInMS });
    }
  };

  useEffect(() => {
    fetchAndSetRealtimeLegs();

    const interval = setInterval(() => {
      fetchAndSetRealtimeLegs();
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

  const validated = currentLeg?.transitLeg
    ? validateTransitLeg(currentLeg, origin, vehicles)
    : true;

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
    validated,
  };
};

export { useRealtimeLegs };
