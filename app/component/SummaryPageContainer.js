import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { ReactRelayContext } from 'react-relay';
import { matchShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import Loading from './Loading';
import { mapLayerShape } from '../store/MapLayerStore';
import { getMapLayerOptions } from '../util/mapLayerUtils';
import { mapLayerOptionsShape } from '../util/shapes';
import { validateServiceTimeRange } from '../util/timeUtils';
import { planQuery } from '../util/queryUtils';
import {
  hasStartAndDestination,
  preparePlanParams,
} from '../util/planParamUtil';
import withBreakpoint from '../util/withBreakpoint';
import LazilyLoad, { importLazy } from './LazilyLoad';

const modules = {
  QueryRenderer: () =>
    importLazy(import('react-relay/lib/ReactRelayQueryRenderer')),
  SummaryPage: () => importLazy(import('./SummaryPage')),
};

const SummaryPageContainer = (
  { content, match, breakpoint, mapLayers, mapLayerOptions, relayEnvironment },
  { config },
) => {
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
      {({ QueryRenderer, SummaryPage }) =>
        /* Don't make a query if start or destination is invalid, only render */
        !hasStartAndDestination(match.params) ? (
          <>
            {screenReaderAlert}
            <SummaryPage
              content={content}
              match={match}
              viewer={{ plan: {} }}
              serviceTimeRange={validateServiceTimeRange()}
              loading={false}
              alertRef={alertRef}
              breakpoint={breakpoint}
              mapLayers={mapLayers}
              mapLayerOptions={mapLayerOptions}
              relayEnvironment={relayEnvironment}
            />
          </>
        ) : (
          <QueryRenderer
            query={planQuery}
            variables={preparePlanParams(config, false)(match.params, match)}
            environment={relayEnvironment}
            render={({ props: innerProps, error }) => {
              return innerProps ? (
                <>
                  {screenReaderAlert}
                  <SummaryPage
                    {...innerProps}
                    content={content}
                    match={match}
                    error={error}
                    loading={false}
                    alertRef={alertRef}
                    breakpoint={breakpoint}
                    mapLayers={mapLayers}
                    mapLayerOptions={mapLayerOptions}
                    relayEnvironment={relayEnvironment}
                  />
                </>
              ) : (
                <>
                  {screenReaderAlert}
                  <SummaryPage
                    content={content}
                    match={match}
                    viewer={{ plan: {} }}
                    serviceTimeRange={validateServiceTimeRange()}
                    loading
                    error={error}
                    alertRef={alertRef}
                    breakpoint={breakpoint}
                    mapLayers={mapLayers}
                    mapLayerOptions={mapLayerOptions}
                    relayEnvironment={relayEnvironment}
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
};

const SummaryPageContainerWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <SummaryPageContainer {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

const SummaryPageContainerWithStores = connectToStores(
  SummaryPageContainerWithBreakpoint,
  ['MapLayerStore'],
  ({ getStore }) => ({
    mapLayers: getStore('MapLayerStore').getMapLayers({
      notThese: ['stop', 'citybike', 'vehicles'],
    }),
    mapLayerOptions: getMapLayerOptions({
      lockedMapLayers: ['vehicles', 'citybike', 'stop'],
      selectedMapLayers: ['vehicles'],
    }),
  }),
);

SummaryPageContainer.contextTypes = {
  config: PropTypes.object.isRequired,
};

SummaryPageContainer.propTypes = {
  content: PropTypes.node,
  match: matchShape.isRequired,
  breakpoint: PropTypes.string.isRequired,
  mapLayers: mapLayerShape.isRequired,
  mapLayerOptions: mapLayerOptionsShape.isRequired,
  relayEnvironment: PropTypes.object.isRequired,
};

export default SummaryPageContainerWithStores;
