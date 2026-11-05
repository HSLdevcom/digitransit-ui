import { useContext, useEffect, useMemo, useState } from 'react';
import { fetchQuery, ReactRelayContext } from 'react-relay';
import { DateTime } from 'luxon';
import { stoptimeHasCancelation } from '../../../utils/client/alertUtils';
import { useConfigContext } from '../../hooks/ConfigContext';
import { tripStopCancelationsQuery } from './queries/TripStopCancelationsQuery';

const NO_CANCELATIONS = new Set();
const HALF_DAY_SECONDS = 12 * 3600;

const toCanceledStopIds = stoptimes =>
  (stoptimes ?? [])
    .filter(stoptimeHasCancelation)
    .map(st => st.stop?.gtfsId)
    .filter(Boolean);

/**
 * The itinerary's trip.stoptimesForDate is resolved for the current day, not for the
 * leg's service date. Its data can be used only when both dates are the same.
 * Midday of the service day is used to be safe on DST changes.
 * Empty stoptimes do not tell the day they were resolved for, so they are not trusted.
 */
const hasStoptimesForServiceDate = (leg, timeZone) => {
  const first = leg.trip.stoptimesForDate?.[0];
  return (
    !!first &&
    DateTime.fromSeconds(first.serviceDay + HALF_DAY_SECONDS, {
      zone: timeZone,
    }).toFormat('yyyyLLdd') === leg.serviceDate
  );
};

/**
 * Resolves the stops whose calls are canceled on the service dates of the given legs.
 * Legs running on the current day use the stoptimes already loaded with the itinerary.
 * Other days are fetched separately, but only when enabled.
 *
 * @param {Array} legs transit legs having trip and serviceDate (YYYYMMDD).
 * @param {boolean} enabled whether fetching other days' cancelations is needed.
 * @returns {Set<string>} gtfsIds of stops with a canceled call.
 */
export default function useCanceledStopIds(legs, enabled = true) {
  const { environment } = useContext(ReactRelayContext);
  const { timeZone } = useConfigContext();
  const [fetched, setFetched] = useState({ key: '', ids: NO_CANCELATIONS });

  const transitLegs = legs.filter(leg => leg.trip?.gtfsId && leg.serviceDate);
  const loadedLegs = transitLegs.filter(leg =>
    hasStoptimesForServiceDate(leg, timeZone),
  );
  // primitive keys keep the memo and the effect stable over new legs array identities
  const loadedKey = JSON.stringify(
    loadedLegs.flatMap(leg => toCanceledStopIds(leg.trip.stoptimesForDate)),
  );
  const fetchKey = JSON.stringify(
    transitLegs
      .filter(leg => !loadedLegs.includes(leg))
      .map(leg => [leg.trip.gtfsId, leg.serviceDate]),
  );

  useEffect(() => {
    // results are kept per key, so toggling the stop chain does not refetch
    const requests = JSON.parse(fetchKey);
    if (!enabled || !requests.length || fetched.key === fetchKey) {
      return undefined;
    }
    let active = true;
    Promise.all(
      requests.map(([tripId, serviceDate]) =>
        fetchQuery(
          environment,
          tripStopCancelationsQuery,
          { tripId, serviceDate },
          { fetchPolicy: 'network-only' },
        ).toPromise(),
      ),
    )
      .then(responses => {
        if (active) {
          const ids = responses.flatMap(response =>
            toCanceledStopIds(response?.trip?.stoptimesForDate),
          );
          setFetched({ key: fetchKey, ids: new Set(ids) });
        }
      })
      .catch(() => {
        // nothing is marked canceled; a later toggle retries
      });
    return () => {
      active = false;
    };
  }, [environment, fetchKey, enabled, fetched.key]);

  return useMemo(() => {
    const fetchedIds = fetched.key === fetchKey ? fetched.ids : NO_CANCELATIONS;
    const loadedIds = JSON.parse(loadedKey);
    if (!loadedIds.length && !fetchedIds.size) {
      return NO_CANCELATIONS;
    }
    return new Set([...loadedIds, ...fetchedIds]);
  }, [loadedKey, fetchKey, fetched]);
}
