/**
 * This [higher-order-component](https://reactjs.org/docs/higher-order-components.html)
 * implements cursor-based iteration to get more itineraries for journey plan query in
 * case that initial query response doesn't contain any or just few.
 */

import PropTypes from 'prop-types';
import React from 'react';
import { matchShape } from 'found';
import useAutofetchRelay from '../hooks/useAutofetchRelay';

const parseQueryVars = props => ({
  from: props.match.params.from,
  to: props.match.params.to,
  time: props.match.location.query.time,
  arriveBy: props.match.location.query.arriveBy,
  intermediatePlaces: props.match.location.query.intermediatePlaces,
  routeSettings: props.routeSettings,
  locale: props.match.location.query.locale,
});

const withNumberOfItineraries = requiredCount => WrappedComponent => {
  const HOCWrapperComponentInit = props => {
    const { itineraries, status, error } = useAutofetchRelay(
      props.relay,
      parseQueryVars(props),
      props.viewer?.plan,
      props.error,
      requiredCount,
    );

    // Set re-fetched itineraries to plan from original query
    const viewer = {
      ...props.viewer,
      plan: {
        ...props.viewer?.plan,
        itineraries: itineraries || [],
      },
    };

    const { nextPageCursor, previousPageCursor } = props.viewer?.plan || {};
    const isLoading = status !== 'COMPLETE' && status !== 'ERROR';

    return (
      <WrappedComponent
        {...props}
        viewer={viewer}
        loading={isLoading || props.loading}
        error={props.error || error}
        itineraryCount={viewer.plan.itineraries.length}
        nextPageCursor={nextPageCursor}
        previousPageCursor={previousPageCursor}
      />
    );
  };

  HOCWrapperComponentInit.displayName = `withFetchInitialItineraries(${
    WrappedComponent.displayName || 'Component'
  })`;

  HOCWrapperComponentInit.propTypes = {
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

  HOCWrapperComponentInit.defaultProps = {
    loading: false,
    error: undefined,
  };

  return HOCWrapperComponentInit;
};

export default withNumberOfItineraries;
