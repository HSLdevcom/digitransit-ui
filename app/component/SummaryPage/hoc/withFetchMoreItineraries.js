/**
 * This [higher-order-component](https://reactjs.org/docs/higher-order-components.html)
 * implements cursor-based iteration to get more itineraries on queries explicitly
 * requested by user.
 *
 * - User requests "onEarlier" and "onLater" require different processing and graphql
 *   variable processing.
 * - Re-fetching logic is encapsulated into "useAutofetchQuery" hook.
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { matchShape, routerShape } from 'found';
import { intlShape } from 'react-intl';

import { preparePlanParams } from '../../../util/planParamUtil';
import { moreItinerariesQuery } from '../../../util/queryUtils';
import {
  findEarliestArrival,
  findLatestDeparture,
} from '../utils/refetchUtils';
import getUniqItineraries from '../utils/uniqItineraries';
import useAutofetchQuery from '../hooks/useAutofetchQuery';

const NUMBER_MORE_ITINERARIES = 3;

/**
 * Clamp value under zero to zero.
 *
 * @param {Number} value
 * @returns {boolean}
 */
export const clamp = value => Math.max(0, value);

const useAutofetchEarlier = (relayEnvironment, onData, onComplete) => {
  const { fetch } = useAutofetchQuery({
    relayEnvironment,
    query: moreItinerariesQuery,
    initialState: {
      missingCount: NUMBER_MORE_ITINERARIES,
    },
    getPageCursor: data => data.plan.previousPageCursor,
    onData,
    onComplete,
    updateState: (data, state) => ({
      ...state,
      missingCount: clamp(state.missingCount - data.plan.itineraries.length),
    }),
    updateVariables: (variables, state) => ({
      ...variables,
      numItineraries: state.missingCount,
    }),
    shouldFetchMore: state => state.missingCount > 0,
  });
  return fetch;
};

const useAutofetchLater = (relayEnvironment, onData, onComplete) => {
  const { fetch } = useAutofetchQuery({
    relayEnvironment,
    query: moreItinerariesQuery,
    initialState: {
      missingCount: NUMBER_MORE_ITINERARIES,
    },
    getPageCursor: data => data.plan.nextPageCursor,
    onData,
    onComplete,
    updateState: (data, state) => ({
      ...state,
      missingCount: clamp(state.missingCount - data.plan.itineraries.length),
    }),
    updateVariables: (variables, state) => ({
      ...variables,
      numItineraries: state.missingCount,
    }),
    shouldFetchMore: state => state.missingCount > 0,
  });
  return fetch;
};

const withItineraryPaging = WrappedComponent => {
  const HOCWrapperComponent = (props, context) => {
    const isParkAndRideSelected = props.match.params.hash === 'parkAndRide';

    const [loadingMoreItineraries, setLoadingMoreItineraries] = useState();
    const [earlierItineraries, setEarlierItineraries] = useState([]);
    const [laterItineraries, setLaterItineraries] = useState([]);
    const [separatorPosition, setSeparatorPosition] = useState();
    const [error, setError] = useState();

    const resetSummaryPageSelection = () => {
      context.router.replace({
        ...context.match.location,
        state: {
          ...context.match.location.state,
          summaryPageSelected: undefined,
        },
      });
    };

    const showScreenreaderLoadedAlert = () => {
      props.srPushAlert(
        'itinerary-page.itineraries-loaded',
        'More itineraries loaded',
      );
    };

    const onDataEarlier = (data, state) => {
      const {
        plan: { itineraries },
      } = data;

      if (state.arriveBy) {
        setLaterItineraries([...laterItineraries, ...itineraries]);
      } else {
        // Reverse the results so that route suggestions are in ascending order
        const reversedItineraries = itineraries
          .slice() // Need to copy because result is readonly
          .reverse()
          .filter(
            itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
          );

        // We need to filter only walk itineraries out to place the "separator" accurately between itineraries
        const merged = getUniqItineraries([
          ...reversedItineraries,
          ...earlierItineraries,
        ]);
        const newUniqCount = merged.length - earlierItineraries.length;
        setEarlierItineraries(merged);
        setSeparatorPosition(
          separatorPosition ? separatorPosition + newUniqCount : newUniqCount,
        );
        resetSummaryPageSelection();
      }
    };

    const onDataLater = (data, state) => {
      const {
        plan: { itineraries },
      } = data;

      if (state.arriveBy) {
        const reversedItineraries = itineraries
          .slice() // Need to copy because result is readonly
          .reverse()
          .filter(
            itinerary => !itinerary.legs.every(leg => leg.mode === 'WALK'),
          );
        // We need to filter only walk itineraries out to place the "separator" accurately between itineraries
        const merged = getUniqItineraries([
          ...reversedItineraries,
          ...earlierItineraries,
        ]);
        const newUniqCount = merged.length - earlierItineraries.length;
        setEarlierItineraries(merged);
        setSeparatorPosition(
          separatorPosition ? separatorPosition + newUniqCount : newUniqCount,
        );
        resetSummaryPageSelection();
      } else {
        setLaterItineraries([...laterItineraries, ...itineraries]);
      }
    };

    const onComplete = () => {
      setLoadingMoreItineraries(undefined);
      showScreenreaderLoadedAlert();
    };

    const fetchEarlier = useAutofetchEarlier(
      props.relayEnvironment,
      onDataEarlier,
      onComplete,
    );

    const fetchLater = useAutofetchLater(
      props.relayEnvironment,
      onDataLater,
      onComplete,
    );

    const buildQueryVariables = (searchTime, arriveBy) => {
      const useDefaultModes = props.itineraryCount === 0;

      const params = {
        wheelchair: null,
        ...preparePlanParams(context.config, useDefaultModes)(
          context.match.params,
          context.match,
        ),
        numItineraries: NUMBER_MORE_ITINERARIES,
        arriveBy,
      };

      if (isParkAndRideSelected) {
        params.modes = [
          { mode: 'CAR', qualifier: 'PARK' },
          { mode: 'TRANSIT' },
        ];
      }

      if (searchTime) {
        params.date = searchTime.format('YYYY-MM-DD');
        params.time = searchTime.format('HH:mm');
      }

      return params;
    };

    const onLater = (itineraries, arriveBy) => {
      const end = moment.unix(props.serviceTimeRange.end);
      const latestDepartureTime = findLatestDeparture(itineraries);
      latestDepartureTime.add(1, 'minutes');
      if (latestDepartureTime >= end) {
        // Departure time is going beyond available time range
        setError('no-route-end-date-not-in-range');
        setLoadingMoreItineraries(undefined);
        return;
      }
      setLoadingMoreItineraries(arriveBy ? 'top' : 'bottom');

      const queryVariables = buildQueryVariables(latestDepartureTime, false);
      fetchLater(queryVariables, {
        arriveBy,
      });
    };

    const onEarlier = (itineraries, arriveBy) => {
      const start = moment.unix(props.serviceTimeRange.start);
      const earliestArrivalTime = findEarliestArrival(itineraries);
      earliestArrivalTime.subtract(1, 'minutes');
      if (earliestArrivalTime <= start) {
        setError('no-route-start-date-too-early');
        setLoadingMoreItineraries(undefined);
        return;
      }

      setLoadingMoreItineraries(arriveBy ? 'bottom' : 'top');

      const queryVariables = buildQueryVariables(earliestArrivalTime, true);
      fetchEarlier(queryVariables, {
        arriveBy,
      });
    };

    return (
      <WrappedComponent
        {...props}
        onLater={onLater}
        onEarlier={onEarlier}
        loadingMoreItineraries={loadingMoreItineraries}
        earlierItineraries={earlierItineraries}
        laterItineraries={laterItineraries}
        separatorPosition={separatorPosition}
        resetSeparator={() => setSeparatorPosition(undefined)}
        loading={props.loading}
        error={error}
        itineraryCount={props.itineraryCount}
      />
    );
  };

  HOCWrapperComponent.displayName = `withFetchMoreItineraries(${
    WrappedComponent.displayName || 'WrappedComponent'
  })`;

  HOCWrapperComponent.contextTypes = {
    config: PropTypes.object,
    executeAction: PropTypes.func.isRequired,
    headers: PropTypes.object.isRequired,
    getStore: PropTypes.func,
    router: routerShape.isRequired, // DT-3358
    match: matchShape.isRequired,
    intl: intlShape.isRequired,
  };

  HOCWrapperComponent.propTypes = {
    match: matchShape.isRequired,
    relayEnvironment: PropTypes.shape({}).isRequired,
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    srPushAlert: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    itineraryCount: PropTypes.number.isRequired,
    viewer: PropTypes.shape({
      plan: PropTypes.shape({
        nextPageCursor: PropTypes.string.isRequired,
        itineraries: PropTypes.arrayOf(
          PropTypes.shape({
            legs: PropTypes.arrayOf(
              PropTypes.shape({
                mode: PropTypes.string,
              }),
            ),
          }),
        ),
      }),
    }).isRequired,
  };

  HOCWrapperComponent.defaultProps = {
    loading: false,
  };

  return HOCWrapperComponent;
};

export default withItineraryPaging;
