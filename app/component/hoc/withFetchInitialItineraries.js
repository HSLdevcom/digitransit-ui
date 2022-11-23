import React from 'react';
import useAutofetchRelay from '../hooks/useAutofetchRelay';

const parseQueryVars = props => ({
    from: props.match.params.from,
    to: props.match.params.to,
    time: props.match.location.query.time,
    arriveBy: props.match.location.query.arriveBy,
    intermediatePlaces: props.match.location.query.intermediatePlaces,
    routeSettings: props.routeSettings,
    locale: props.match.location.query.locale,
})

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
        )
    }
    return HOCWrapperComponentInit;
}

export default withNumberOfItineraries;