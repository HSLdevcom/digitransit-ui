import cloneDeep from 'lodash/cloneDeep';
import { useCallback, useRef } from 'react';
import { legTime } from '../../../../util/legUtils';
import {
  fakeDelay,
  matchLegEnds,
  shiftLegsByGeolocation,
} from './utils/realtimeLegUtils';

const GEOLOCATED_LEGS = false;

/**
 * Custom hook to process and update real-time legs.
 * @param {Object} params - Parameters for processing legs.
 * @param {boolean} params.simulateTransferProblem - Whether to simulate transfer problems.
 * @param {Object} params.position - Current position of the user.
 * @param {Object} params.vehicles - Vehicle data for geolocation adjustments.
 * @param {Object} params.origin - Origin point for geolocation adjustments.
 * @returns {Function} A function to process and update legs.
 */
const useProcessLegs = (
  simulateTransferProblem,
  position,
  vehicles,
  origin,
) => {
  const simCounter = useRef(0);

  const processLegs = useCallback(
    (prevLegs, rtLegMap, now) => {
      const newRtLegs = prevLegs.map(leg => {
        const l = cloneDeep(leg);
        const rtLeg =
          l.legId && rtLegMap?.[l.legId] ? { ...rtLegMap[l.legId] } : null;
        if (rtLeg) {
          if (l.freezeStart) {
            delete rtLeg.start;
          }
          return {
            ...l,
            ...rtLeg,
            to: {
              ...l.to,
              vehicleRentalStation: rtLeg.to.vehicleRentalStation,
            },
          };
        }
        return l;
      });

      // Simulate transfer problems if enabled
      if (simulateTransferProblem) {
        fakeDelay(newRtLegs, simCounter.current);
        simCounter.current += 1;
      }

      // Match leg ends to ensure continuity
      matchLegEnds(newRtLegs, now);

      // Apply geolocation shifts if enabled
      if (GEOLOCATED_LEGS) {
        shiftLegsByGeolocation(newRtLegs, now, vehicles, position, origin);
        matchLegEnds(newRtLegs, now); // Re-match after geolocation shifts
      }

      // Freeze legs that have started or ended in the past
      newRtLegs.forEach(l => {
        /* eslint-disable no-param-reassign */
        l.freezeStart = l.freezeStart || legTime(l.start) <= now;
        l.freezeEnd = l.freezeEnd || legTime(l.end) <= now;
      });

      return newRtLegs;
    },
    [vehicles],
  );

  return processLegs;
};

export default useProcessLegs;
