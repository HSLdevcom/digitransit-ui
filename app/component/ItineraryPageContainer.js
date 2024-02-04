import PropTypes from 'prop-types';
import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  lazy,
  Suspense,
} from 'react';
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
  const alertRef = useRef();

  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });
  if (!isClient) {
    return <Loading />;
  }
  const screenReaderAlert = (
    <div
      className="sr-only"
      role="alert"
      ref={alertRef}
      id="summarypage-screenreader-alert"
    />
  );

  return (
    <Suspense fallback={<Loading />}>
      {' '}
      {
        /* Don't make a query if start or destination is invalid, only render */
        !hasStartAndDestination(match.params) ? (
          <>
            {screenReaderAlert}
            <ItineraryPage
              content={content}
              match={match}
              viewer={{ plan: {} }}
              serviceTimeRange={validateServiceTimeRange()}
              loading={false}
              alertRef={alertRef}
            />
          </>
        ) : (
          <QueryRenderer
            query={planQuery}
            variables={getPlanParams(config, match)}
            environment={environment}
            render={({ props: innerProps, error }) => {
              return innerProps ? (
                <>
                  {screenReaderAlert}
                  <ItineraryPage
                    {...innerProps}
                    content={content}
                    match={match}
                    error={error}
                    loading={false}
                    alertRef={alertRef}
                  />
                </>
              ) : (
                <>
                  {screenReaderAlert}
                  <ItineraryPage
                    content={content}
                    match={match}
                    viewer={{ plan: {} }}
                    serviceTimeRange={validateServiceTimeRange()}
                    loading
                    error={error}
                    alertRef={alertRef}
                  />
                </>
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
