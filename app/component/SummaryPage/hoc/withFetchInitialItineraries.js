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
  const HOCWrapperComponent = props => {
    const { itineraries, status } = useAutofetchRelay(
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

    return (
      <WrappedComponent
        {...props}
        viewer={viewer}
        loading={status !== 'COMPLETE' || props.loading}
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
