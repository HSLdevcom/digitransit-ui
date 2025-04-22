import cloneDeep from 'lodash/cloneDeep';
import polyUtil from 'polyline-encoded';
import { useState } from 'react';
import { GeodeticToEcef, GeodeticToEnu } from '../../../../util/geo-utils';
import { legTime } from '../../../../util/legUtils';

/**
 * Initializes the state for real-time legs.
 * @param {Array} initialLegs - The initial legs of the itinerary.
 * @returns {Array} State and state updater function.
 */
const useLegState = initialLegs => {
  const getInitialState = legs => {
    const time = Date.now();
    if (legs.length) {
      const origin = GeodeticToEcef(legs[0].from.lat, legs[0].from.lon);
      return {
        origin,
        time,
        realTimeLegs: legs.map(leg => {
          const geometry = polyUtil.decode(leg.legGeometry.points);
          const clonedLeg = cloneDeep(leg);
          clonedLeg.geometry = geometry.map(p =>
            GeodeticToEnu(p[0], p[1], origin),
          );
          clonedLeg.freezeStart = legTime(clonedLeg.start) <= time;
          clonedLeg.freezeEnd = legTime(clonedLeg.end) <= time;
          clonedLeg.originalStart = cloneDeep(leg.start);
          clonedLeg.originalEnd = cloneDeep(leg.end);
          return clonedLeg;
        }),
      };
    }
    return {
      time,
      realTimeLegs: [],
    };
  };

  const [state, setState] = useState(() => getInitialState(initialLegs));
  return [state, setState];
};

export default useLegState;
