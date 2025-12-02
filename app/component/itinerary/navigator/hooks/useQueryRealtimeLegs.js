import { useCallback } from 'react';
import { fetchQuery } from 'react-relay';
import { legTime } from '../../../../util/legUtils';
import { legQuery } from '../../queries/LegQuery';

/**
 * Custom hook to query and map real-time legs.
 * @param {Object} relayEnvironment - Relay environment for GraphQL queries.
 * @returns {Function} A function to query and map real-time legs.
 */
const useQueryRealtimeLegs = relayEnvironment => {
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

  return queryAndMapRealtimeLegs;
};

export default useQueryRealtimeLegs;
