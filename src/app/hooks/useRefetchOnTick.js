import { useEffect, useRef, startTransition } from 'react';
import { fetchQuery, useRelayEnvironment } from 'react-relay';
import { getRefetchMetadata, getSelector } from 'relay-runtime';
import { RRNLError } from 'react-relay-network-modern';
import { useCurrentTime } from './TimeContext';

/**
 * Refreshes the data of a @refetchable fragment every time the current time ticks.
 * The data is first fetched into the Relay store, and only then applied with refetch,
 * which reads it from the store without suspending. A failed request leaves the current
 * data in place and the next tick retries, instead of throwing to an error boundary.
 * Only network layer errors are ignored, other errors are not swallowed.
 * A tick is skipped while the previous request is still in flight, so slow connections
 * don't stack requests.
 *
 * @param {function} refetch the refetch function of useRefetchableFragment
 * @param {object} fragment the fragment definition
 * @param {object} fragmentRef the fragment reference given to the component
 * @param {boolean} enabled whether refetching is active
 */
export default function useRefetchOnTick(refetch, fragment, fragmentRef, enabled = true) {
  const environment = useRelayEnvironment();
  const currentTime = useCurrentTime();
  const mounted = useRef(false);
  const inFlight = useRef(false);

  useEffect(() => {
    // data was just fetched by the parent query
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (enabled && !inFlight.current) {
      const { variables } = getSelector(fragment, fragmentRef);
      // refetch query generated for the @refetchable fragment; exported by relay-runtime but not documented
      const { refetchableRequest: query } = getRefetchMetadata(fragment, 'useRefetchOnTick');
      // time windowed fragments move their window forward
      const newVariables = 'startTime' in variables ? { startTime: currentTime } : {};
      inFlight.current = true;
      fetchQuery(
        environment,
        query,
        {
          ...variables,
          ...newVariables,
          // eslint-disable-next-line no-underscore-dangle
          id: fragmentRef.__id,
        },
        { fetchPolicy: 'network-only' },
      )
        .toPromise()
        .then(
          () => {
            startTransition(() => {
              refetch(newVariables, { fetchPolicy: 'store-or-network' });
            });
          },
          err => {
            // TypeError is fetch's network failure (offline)
            if (!(err instanceof RRNLError || err instanceof TypeError)) {
              throw err;
            }
          },
        )
        .finally(() => {
          inFlight.current = false;
        });
    }
  }, [currentTime, enabled]);
}
