import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { ReactRelayContext } from 'react-relay';
import { matchShape } from 'found';
import Loading from './Loading';
import { validateServiceTimeRange } from '../util/timeUtils';
import { planQuery } from './ItineraryQueries';
import {
  hasStartAndDestination,
  preparePlanParams,
} from '../util/planParamUtil';
import LazilyLoad, { importLazy } from './LazilyLoad';

const modules = {
  QueryRenderer: () =>
    importLazy(import('react-relay/lib/ReactRelayQueryRenderer')),
  ItineraryPage: () => importLazy(import('./ItineraryPage')),
};

export default function ItineraryPageContainer({ content, match }, { config }) {
  const { environment } = useContext(ReactRelayContext);
  const [isClient, setClient] = useState(false);
  const alertRef = useRef();

  const screenReaderAlert = (
    <div
      className="sr-only"
      role="alert"
      ref={alertRef}
      id="summarypage-screenreader-alert"
    />
  );

  useEffect(() => {
    // To prevent SSR from rendering something https://reactjs.org/docs/react-dom.html#hydrate
    setClient(true);
  });
  return isClient ? (
    <LazilyLoad modules={modules}>
      {({ QueryRenderer, ItineraryPage }) =>
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
            variables={preparePlanParams(config, false)(match.params, match)}
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
    </LazilyLoad>
  ) : (
    <Loading />
  );
}

ItineraryPageContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

ItineraryPageContainer.propTypes = {
  content: PropTypes.node,
  match: matchShape.isRequired,
};
