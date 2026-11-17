import { useEffect, useRef, startTransition } from 'react';
import { fetchQuery, useRelayEnvironment } from 'react-relay';
import { getSelector } from 'relay-runtime';
import { useCurrentTime } from './TimeContext';

/**
 * Refreshes the data of a @refetchable fragment every time the current time ticks.
 * The data is first fetched into the Relay store, and only then applied with refetch,
 * which reads it from the store without suspending. A failed request leaves the current
 * data in place and the next tick retries, instead of throwing to an error boundary.
 *
 * @param {function} refetch the refetch function of useRefetchableFragment
 * @param {object} fragment the fragment definition
 * @param {object} fragmentRef the fragment reference given to the component
 * @param {object} query the generated refetch query of the fragment
 * @param {boolean} enabled whether refetching is active
 */
export default function useRefetchOnTick(
  refetch,
  fragment,
  fragmentRef,
  query,
  enabled = true,
) {
  const environment = useRelayEnvironment();
  const currentTime = useCurrentTime();
  const mounted = useRef(false);

  useEffect(() => {
    // data was just fetched by the parent query
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (enabled) {
      const { variables } = getSelector(fragment, fragmentRef);
      // time windowed fragments move their window forward
      const newVariables =
        'startTime' in variables ? { startTime: currentTime } : {};
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
        .then(() => {
          startTransition(() => {
            refetch(newVariables, { fetchPolicy: 'store-or-network' });
          });
        })
        .catch(() => {});
    }
  }, [currentTime, enabled]);
}
