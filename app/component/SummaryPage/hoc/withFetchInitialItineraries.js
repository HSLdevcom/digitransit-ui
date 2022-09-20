/**
 * This [higher-order-component](https://reactjs.org/docs/higher-order-components.html)
 * implements cursor-based iteration to get more itineraries for journey plan query in
 * case that initial query response doesn't contain any or just few.
 *
 * - Query response updates are detected by deep-comparing changes of the
 *   property "viewer.plan.itineraries".
 * - User-provided plan queryVariables updates are detected by deep-compare.
 *
 *  State diagram:
 *
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

import PropTypes from 'prop-types';
import React, { useEffect, useReducer } from 'react';
import { matchShape } from 'found';
import isEqual from 'lodash/isEqual';
import getUniqItineraries from '../utils/uniqItinereries';

/**
 * Clamp value under zero to zero.
 *
 * @param {Number} value
 * @returns {boolean}
 */
export const clamp = value => Math.max(0, value);

const parseQueryVars = props => ({
  from: props.match.params.from,
  to: props.match.params.to,
  time: props.match.location.query.time,
  arriveBy: props.match.location.query.arriveBy,
  intermediatePlaces: props.match.location.query.intermediatePlaces,
  routeSettings: props.routeSettings,
  locale: props.match.location.query.locale,
});

const ACTION_MOUNTED = 'MOUNTED';
const ACTION_DATA_UPDATE = 'DATA_UPDATE';
const ACTION_QUERY_UPDATE = 'QUERY_UPDATE';
const ACTION_ERROR = 'ERROR';

const STATUS_FETCHING = 'FETCHING';
const STATUS_REFETCHING = 'REFETCHING';
const STATUS_COMPLETE = 'COMPLETE';

const detectFetching = viewerData =>
  typeof viewerData.plan?.itineraries === 'undefined';

const dataUpdateReducer = (state, action) => {
  const { payload } = action;
  const updatedItineraries = getUniqItineraries([
    ...(state.itineraries || []),
    ...(payload.viewer.plan?.itineraries || []),
  ]);

  const numMissing = clamp(state.requiredCount - updatedItineraries.length);

  return {
    ...state,
    status: numMissing > 0 ? STATUS_REFETCHING : STATUS_COMPLETE,
    nextPageCursor: payload.viewer.plan?.nextPageCursor,
    previousPageCursor: payload.viewer.plan?.previousPageCursor,
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
        itineraries: payload.viewer.plan?.itineraries,
        nextPageCursor: payload.viewer.plan?.nextPageCursor,
        previousPageCursor: payload.viewer.plan?.previousPageCursor,
        queryVariables: payload.queryVariables,
        status: detectFetching(payload.viewer)
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
        status: STATUS_COMPLETE,
        nextPageCursor: undefined,
        previousPageCursor: undefined,
      };

    default:
      return state;
  }
};

const withNumberOfItineraries = requiredCount => WrappedComponent => {
  const HOCWrapperComponent = props => {
    const initialState = {
      queryVariables: parseQueryVars(props),
      requiredCount,
    };
    const [state, dispatch] = useReducer(reducer, initialState);

    const onRefetchComplete = () => {
      dispatch({
        type: ACTION_DATA_UPDATE,
        payload: {
          viewer: props.viewer,
        },
      });
    };

    useEffect(() => {
      dispatch({
        action: ACTION_MOUNTED,
        viewer: props.viewer,
        queryVariables: parseQueryVars(props),
      });
    }, []);

    useEffect(() => {
      if (props.error) {
        dispatch({ type: ACTION_ERROR });
      }
    }, [props.error]);

    /**
     * Respond to reducer state status changes with side-effect functionality.
     */
    useEffect(() => {
      switch (state.status) {
        case STATUS_FETCHING:
          break;

        case STATUS_REFETCHING:
          props.relay.refetch(
            prevVariables => ({
              ...prevVariables,
              numItineraries: state.numMissing,
              pageCursor: prevVariables.arriveBy
                ? state.previousPageCursor
                : state.nextPageCursor,
            }),
            undefined,
            onRefetchComplete,
          );
          break;

        case STATUS_COMPLETE:
          // if (typeof onComplete === 'function') onComplete(state.itineraries)
          break;

        default:
          break;
      }
    }, [state]);

    /**
     * Detect user-made updates to query variables eg. from, to, arriveBy.
     */
    useEffect(() => {
      const areVariablesChanged = !isEqual(
        state.queryVariables,
        parseQueryVars(props),
      );

      // reset itinerary listing when query variables change
      if (areVariablesChanged) {
        dispatch({ type: ACTION_QUERY_UPDATE, payload: parseQueryVars(props) });
      }
    }, [props]);

    /**
     * Detect updates to query response data.
     */
    useEffect(() => {
      const isDataUpdated = !isEqual(
        state.itineraries,
        props.viewer.plan?.itineraries,
      );

      if (isDataUpdated) {
        dispatch({
          type: ACTION_DATA_UPDATE,
          payload: { viewer: props.viewer },
        });
      }
    }, [props.viewer]);

    // Set re-fetched itineraries to plan from original query
    const viewer = {
      ...props.viewer,
      plan: {
        ...props.viewer?.plan,
        itineraries: state.itineraries || [],
      },
    };

    const { nextPageCursor, previousPageCursor } = props.viewer?.plan || {};

    return (
      <WrappedComponent
        {...props}
        viewer={viewer}
        loading={state.status !== STATUS_COMPLETE || props.loading}
        itineraryCount={viewer.plan.itineraries.length}
        nextPageCursor={nextPageCursor}
        previousPageCursor={previousPageCursor}
      />
    );
  };

  HOCWrapperComponent.displayName = `withFetchInitialItineraries(${
    WrappedComponent.displayName || 'Component'
  })`;

  HOCWrapperComponent.propTypes = {
    viewer: PropTypes.shape({
      plan: PropTypes.shape({
        itineraries: PropTypes.arrayOf(PropTypes.shape({})),
        nextPageCursor: PropTypes.string,
        previousPageCursor: PropTypes.string,
      }),
    }).isRequired,
    error: PropTypes.shape({
      name: PropTypes.string,
    }),
    loading: PropTypes.bool,
    relayEnvironment: PropTypes.shape({}).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    match: matchShape.isRequired,
  };

  HOCWrapperComponent.defaultProps = {
    loading: false,
    error: undefined,
  };

  return HOCWrapperComponent;
};

export default withNumberOfItineraries;
