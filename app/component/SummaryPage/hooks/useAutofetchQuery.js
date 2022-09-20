import { useEffect, useReducer } from 'react';
import { fetchQuery } from 'react-relay';

/**
 * Relay runtime query result re-fetch hook.
 *
 * @typedef {AutofetchInitializer}
 * @property {RelayEnvironment} relayEnvironment
 * @prop {Object.<String,*>} initialState
 * @prop {GraphQLQuery} query
 * @prop {Function} getPageCursor
 * @prop {Function} onData
 * @prop {Function} onComplete
 * @prop {Function} updateState
 * @prop {Function} updateVariables
 * @prop {function} shouldFetchMore
 *
 * @param {AutofetchInitializer} opts
 */
const useAutofetchQuery = ({
  relayEnvironment,
  initialState,
  query,
  getPageCursor,
  onData,
  onComplete,
  updateState,
  updateVariables,
  shouldFetchMore,
}) => {
  const reducerInitState = {
    pageCursor: undefined,
    userState: initialState || {},
    shouldFetch: false,
    variables: {},
    data: undefined,
    status: 'READY',
    error: undefined,
  };

  const ACTION_DATA = 'data';
  const ACTION_START = 'start';
  const ACTION_ERROR = 'error';
  const ACTION_DATA_COMPLETE = 'data-complete';

  const STATUS_PROCESSING = 'PROCESSING';
  const STATUS_COMPLETE = 'COMPLETE';
  const STATUS_FETCHING = 'FETCHING';
  const STATUS_READY = 'READY';

  const dataReducer = (state, payload) => {
    const userState = updateState(payload.data, state.userState);
    const variables = {
      ...updateVariables(state.variables, userState),
      pageCursor:
        typeof getPageCursor === 'function'
          ? getPageCursor(payload.data, state.userState)
          : undefined,
    };
    const shouldFetch = shouldFetchMore(userState);

    return {
      ...state,
      userState,
      variables,
      shouldFetch,
      data: payload.data,
      status: shouldFetch ? STATUS_PROCESSING : STATUS_COMPLETE,
    };
  };

  /**
   * Reducer status diagram:
   *
   *   _________      ____________      ______________      ____________
   *  |         |    |            |    |              |    |            |
   *  |  READY  |--->|  FETCHING  |--->|  PROCESSING  |--->|  COMPLETE  |
   *  |_________|    |____________|    |______________|    |____________|
   *         |             ^                  |                  ^
   *         |             |                  |                  |
   *         |             +------------------+                  |
   *         +---------------------------------------------------+
   */
  const reducer = (state, { type, payload }) => {
    switch (type) {
      case ACTION_DATA:
        return dataReducer(state, payload);

      case ACTION_START:
        return {
          ...state,
          userState: {
            ...state.userState,
            ...(payload.queryUserState || {}),
          },
          variables: payload.variables,
          shouldFetch: false,
          data: undefined,
          status: STATUS_FETCHING,
        };

      case ACTION_DATA_COMPLETE:
        return {
          ...state,
          data: undefined,
          status: STATUS_READY,
        };

      case ACTION_ERROR:
        return {
          ...state,
          data: undefined,
          status: STATUS_COMPLETE,
          error: payload,
        };

      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, reducerInitState);

  useEffect(() => {
    switch (state.status) {
      case STATUS_COMPLETE:
        if (typeof onData === 'function') {
          onData(state.data, state.userState);
        }
        if (typeof onComplete === 'function') {
          onComplete();
        }
        break;

      case STATUS_PROCESSING:
        if (typeof onData === 'function') {
          try {
            onData(state.data, state.userState);
            dispatch({ type: ACTION_DATA_COMPLETE });
          } catch (err) {
            dispatch({ type: ACTION_ERROR, payload: err });
          }
        }
        break;

      case STATUS_FETCHING:
        fetchQuery(relayEnvironment, query, state.variables)
          .then(data => {
            dispatch({ type: ACTION_DATA, payload: { data } });
          })
          .catch(err => {
            dispatch({ type: ACTION_ERROR, payload: err });
          });
        break;

      case STATUS_READY:
        if (state.variables.pageCursor) {
          // refetch
          dispatch({
            type: ACTION_START,
            payload: { variables: state.variables },
          });
        }
        break;

      default:
        break;
    }
  }, [state]);

  const fetch = (variables, fetchInitState) => {
    const queryUserState = {
      ...(initialState || {}),
      ...(fetchInitState || {}),
    };

    // skip double loading
    if (![STATUS_COMPLETE, STATUS_READY].includes(state.status)) {
      return;
    }

    // initial fetch
    dispatch({
      type: ACTION_START,
      payload: { variables, queryUserState },
    });
  };

  return {
    fetch,
    isFetching: state.status === STATUS_FETCHING,
    isError: Boolean(state.error),
  };
};

export default useAutofetchQuery;
