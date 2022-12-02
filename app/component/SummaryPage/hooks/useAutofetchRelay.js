import { useEffect, useReducer } from 'react';
import isEqual from 'lodash/isEqual';
import getUniqItineraries from '../utils/uniqItineraries';
import createCancelable from '../utils/createCancelable';

const ACTION_ITINERARIES_UPDATE = 'ITINERARIES_UPDATE';
const ACTION_QUERY_UPDATE = 'QUERY_UPDATE';
const ACTION_ERROR = 'ERROR';

const STATUS_FETCHING = 'FETCHING';
const STATUS_REFETCHING = 'REFETCHING';
const STATUS_COMPLETE = 'COMPLETE';
const STATUS_ERROR = 'ERROR';

const MAX_REFETCH_NUMBER = 4;

/**
 * Clamp value under zero to zero.
 *
 * @param {Number} value
 * @returns {boolean}
 */
const clamp = value => Math.max(0, value);

const isInitialFetch = plan => typeof plan?.itineraries === 'undefined';

const hasPageLeft = (plan, queryVariables) =>
  queryVariables?.arriveBy ? plan?.previousPageCursor : plan?.nextPageCursor;

const dataUpdateReducer = (state, action) => {
  const { payload } = action;

  const updatedItineraries = getUniqItineraries([
    ...(state.itineraries || []),
    ...(payload.plan?.itineraries || []),
  ]);

  const numMissing = clamp(state.requiredCount - updatedItineraries.length);

  const status =
    numMissing > 0 &&
    hasPageLeft(payload.plan, state.queryVariables) &&
    (state.numRefetch === undefined || state.numRefetch <= MAX_REFETCH_NUMBER)
      ? STATUS_REFETCHING
      : STATUS_COMPLETE;

  return {
    ...state,
    status,
    nextPageCursor: payload.plan?.nextPageCursor,
    previousPageCursor: payload.plan?.previousPageCursor,
    itineraries: updatedItineraries,
    numMissing,
    numRefetch:
      state.numRefetch !== undefined && status !== STATUS_COMPLETE
        ? state.numRefetch + 1
        : 0,
  };
};

const reducer = (state, action) => {
  const { type, payload } = action;

  switch (type) {
    case ACTION_QUERY_UPDATE:
      return {
        ...state,
        itineraries: payload.plan?.itineraries,
        nextPageCursor: payload.plan?.nextPageCursor,
        previousPageCursor: payload.plan?.previousPageCursor,
        queryVariables: payload.queryVariables,
        status: isInitialFetch(payload.plan)
          ? STATUS_FETCHING
          : STATUS_COMPLETE,
        numRefetch: 0,
      };

    case ACTION_ITINERARIES_UPDATE:
      return dataUpdateReducer(state, action);

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
      type: ACTION_ITINERARIES_UPDATE,
      payload: {
        plan,
      },
    });
  };

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
        type: ACTION_QUERY_UPDATE,
        payload: {
          plan,
          queryVariables,
        },
      });
      return;
    }

    const hasNewItineraries = () =>
      (state.itineraries === undefined && plan?.itineraries) ||
      plan?.itineraries?.some(
        planItinerary =>
          !(
            Array.isArray(state.itineraries) &&
            state.itineraries.some(stateItinerary =>
              isEqual(planItinerary, stateItinerary),
            )
          ),
      );

    // ...or detect updates to query response data.
    if (hasNewItineraries()) {
      dispatch({
        type: ACTION_ITINERARIES_UPDATE,
        payload: { plan },
      });
    }
  }, [queryVariables, plan?.itineraries]);

  return {
    itineraries: state.itineraries,
    status: state.status,
    error: state.error,
  };
};

export default useAutofetchRelay;
