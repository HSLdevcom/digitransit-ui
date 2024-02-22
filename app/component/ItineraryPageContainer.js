import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState, lazy, Suspense } from 'react';
import { ReactRelayContext } from 'react-relay';
import { matchShape } from 'found';
import Loading from './Loading';
import { validateServiceTimeRange } from '../util/timeUtils';
import { planQuery } from './ItineraryQueries';
import { hasStartAndDestination, getPlanParams } from '../util/planParamUtil';

const QueryRenderer = lazy(
  () => import('react-relay/lib/ReactRelayQueryRenderer'),
);
const ItineraryPage = lazy(() => import('./ItineraryPage'));

export default function ItineraryPageContainer({ content, match }, { config }) {
  const { environment } = useContext(ReactRelayContext);
  const [isClient, setClient] = useState(false);

  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });
  if (!isClient) {
    return <Loading />;
  }
  return (
    <Suspense fallback={<Loading />}>
      {' '}
      {
        /* Don't make a query if start or destination is invalid, only render */
        !hasStartAndDestination(match.params) ? (
          <ItineraryPage
            content={content}
            match={match}
            viewer={{ plan: {} }}
            serviceTimeRange={validateServiceTimeRange()}
            loading={false}
          />
        ) : (
          <QueryRenderer
            query={planQuery}
            variables={getPlanParams(config, match)}
            environment={environment}
            render={({ props: innerProps, error }) => {
              return innerProps ? (
                <ItineraryPage
                  {...innerProps}
                  content={content}
                  match={match}
                  error={error}
                  loading={false}
                />
              ) : (
                <ItineraryPage
                  content={content}
                  match={match}
                  viewer={{ plan: {} }}
                  serviceTimeRange={validateServiceTimeRange()}
                  loading
                  error={error}
                />
              );
            }}
          />
        )
      }
    </Suspense>
  );
}

ItineraryPageContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

ItineraryPageContainer.propTypes = {
  content: PropTypes.node,
  match: matchShape.isRequired,
};
