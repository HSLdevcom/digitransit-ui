import { useEffect, useReducer } from 'react';
import isEqual from 'lodash/isEqual';
import getUniqItineraries from '../utils/uniqItineraries';
import createCancelable from '../utils/createCancelable';

const ACTION_MOUNTED = 'MOUNTED';
const ACTION_DATA_UPDATE = 'DATA_UPDATE';
const ACTION_QUERY_UPDATE = 'QUERY_UPDATE';
const ACTION_ERROR = 'ERROR';

const STATUS_FETCHING = 'FETCHING';
const STATUS_REFETCHING = 'REFETCHING';
const STATUS_COMPLETE = 'COMPLETE';
const STATUS_ERROR = 'ERROR';

/**
 * Clamp value under zero to zero.
 *
 * @param {Number} value
 * @returns {boolean}
 */
const clamp = value => Math.max(0, value);

const isInitialFetch = plan => typeof plan?.itineraries === 'undefined';

const dataUpdateReducer = (state, action) => {
  const { payload } = action;

  const updatedItineraries = getUniqItineraries([
    ...(state.itineraries || []),
    ...(payload.plan?.itineraries || []),
  ]);

  const numMissing = clamp(state.requiredCount - updatedItineraries.length);

  return {
    ...state,
    status: numMissing > 0 ? STATUS_REFETCHING : STATUS_COMPLETE,
    nextPageCursor: payload.plan?.nextPageCursor,
    previousPageCursor: payload.plan?.previousPageCursor,
    itineraries: updatedItineraries,
    numMissing,
  };
};

const reducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case ACTION_MOUNTED:
      return {
        ...state,
        itineraries: payload.plan?.itineraries,
        nextPageCursor: payload.plan?.nextPageCursor,
        previousPageCursor: payload.plan?.previousPageCursor,
        queryVariables: payload.queryVariables,
        status: isInitialFetch(payload.plan)
          ? STATUS_FETCHING
          : STATUS_COMPLETE,
      };

    case ACTION_DATA_UPDATE:
      return dataUpdateReducer(state, action);

    case ACTION_QUERY_UPDATE:
      return {
        ...state,
        status: STATUS_FETCHING,
        queryVariables: payload,
        nextPageCursor: undefined,
        previousPageCursor: undefined,
        itineraries: [],
      };

    case ACTION_ERROR:
      return {
        ...state,
        status: STATUS_ERROR,
        nextPageCursor: undefined,
        previousPageCursor: undefined,
        error: payload,
      };

    default:
      return state;
  }
};

/**
 * Re-fetch hook which executes refetch queries if initial query doesn't
 * return at least `requiredCount` of results.
 *
 * - Query response updates are detected by deep-comparing changes of the
 *   property "viewer.plan.itineraries".
 * - User-provided plan queryVariables updates are detected by deep-compare.
 *
 *  Status state diagram:
 *                                                            ____________
 *                                                           |            |
 *         +-----------------+------------------+----------->|   ERROR    |
 *         |                 |                  |            |____________|
 *         |                 |                  |
 *   _____________      ____________      ______________      ____________
 *  |             |    |            |    |              |    |            |
 *  |  undefined  |--->|  FETCHING  |--->|  REFETCHING  |--->|  COMPLETE  |
 *  |_____________|    |____________|    |______________|    |____________|
 *         |                                 ^      |              ^
 *         |                                 |      |              |
 *         |                                 +------+              |
 *         +-------------------------------------------------------+
 *
 */
const useAutofetchRelay = (
  relay,
  queryVariables,
  plan,
  error,
  requiredCount,
) => {
  const initialState = {
    queryVariables,
    requiredCount,
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const onRefetchComplete = () => {
    dispatch({
      type: ACTION_DATA_UPDATE,
      payload: {
        plan,
      },
    });
  };

  useEffect(() => {
    dispatch({
      type: ACTION_MOUNTED,
      payload: {
        plan,
        queryVariables,
      },
    });
  }, []);

  useEffect(() => {
    if (error) {
      dispatch({ type: ACTION_ERROR, payload: error });
    }
  }, [error]);

  /**
   * Respond to reducer state status changes with side-effect functionality.
   */
  useEffect(() => {
    // create cancelable callback function wrapper
    const { cancel: cancelRefetch, cancelable } = createCancelable();

    switch (state.status) {
      case STATUS_FETCHING:
        break;

      case STATUS_REFETCHING:
        relay.refetch(
          prevVariables => ({
            ...prevVariables,
            numItineraries: state.numMissing,
            pageCursor: prevVariables.arriveBy
              ? state.previousPageCursor
              : state.nextPageCursor,
          }),
          undefined,
          cancelable(onRefetchComplete),
        );
        break;

      case STATUS_COMPLETE:
        // if (typeof onComplete === 'function') onComplete(state.itineraries)
        break;

      default:
        break;
    }

    return () => {
      cancelRefetch();
    };
  }, [state]);

  useEffect(() => {
    // either detect user-made updates to query variables eg. from, to, arriveBy...
    const isQueryUpdated = !isEqual(state.queryVariables, queryVariables);
    if (isQueryUpdated) {
      // reset itinerary listing when query variables change
      dispatch({
        type: ACTION_MOUNTED,
        payload: {
          plan,
          queryVariables,
        },
      });
      return;
    }

    // ...or detect updates to query response data.
    const isDataUpdated = !isEqual(state.itineraries, plan?.itineraries);
    if (isDataUpdated) {
      dispatch({
        type: ACTION_DATA_UPDATE,
        payload: { plan },
      });
    }
  });

  return {
    itineraries: state.itineraries,
    status: state.status,
    error: state.error,
  };
};

export default useAutofetchRelay;
