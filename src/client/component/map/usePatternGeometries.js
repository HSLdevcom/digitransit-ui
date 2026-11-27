import { useContext, useEffect, useState } from 'react';
import { fetchQuery, ReactRelayContext } from 'react-relay';
import { patternGeometryQuery } from '../itinerary/queries/PatternGeometryQuery';

const NO_GEOMETRIES = {};

/**
 * Fetches the scheduled geometries and stops of patterns.
 * @param {string[]} codes pattern codes
 * @returns {Object<string, {geometry: Array<[number, number]>, stops: Array}>} by pattern code
 */
export default function usePatternGeometries(codes) {
  const { environment } = useContext(ReactRelayContext);
  const [geometries, setGeometries] = useState(NO_GEOMETRIES);
  // a primitive key keeps the effect stable over new arrays
  const key = JSON.stringify([...new Set(codes)].sort());

  useEffect(() => {
    const missing = JSON.parse(key).filter(code => !geometries[code]);
    if (!missing.length) {
      return undefined;
    }
    let active = true;
    Promise.all(
      missing.map(code =>
        fetchQuery(environment, patternGeometryQuery, { code })
          .toPromise()
          .then(response => [
            code,
            {
              geometry: response?.pattern?.geometry?.map(({ lat, lon }) => [lat, lon]) ?? [],
              stops: response?.pattern?.stops ?? [],
            },
          ]),
      ),
    )
      .then(entries => {
        if (active) {
          setGeometries(prev => ({ ...prev, ...Object.fromEntries(entries) }));
        }
      })
      .catch(() => {
        // the dashed path falls back to straight lines between the stops
      });
    return () => {
      active = false;
    };
  }, [environment, key, geometries]);

  return geometries;
}
