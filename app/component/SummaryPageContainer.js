import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { ReactRelayContext, useLazyLoadQuery } from 'react-relay';
import { matchShape } from 'found';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { mapLayerShape } from '../store/MapLayerStore';
import { getMapLayerOptions } from '../util/mapLayerUtils';
import { mapLayerOptionsShape } from '../util/shapes';
import { planQuery } from '../util/queryUtils';
import {
  hasStartAndDestination,
  preparePlanParams,
} from '../util/planParamUtil';
import withBreakpoint from '../util/withBreakpoint';
import SummaryPage from './SummaryPage';

const SummaryPageContainer = (
  { content, match, breakpoint, mapLayers, mapLayerOptions, relayEnvironment },
  { config },
) => {
  const alertRef = useRef();

  const screenReaderAlert = (
    <div
      className="sr-only"
      role="alert"
      ref={alertRef}
      id="summarypage-screenreader-alert"
    />
  );
  /* Don't make a query if start or destination is invalid, only render */
  if (!hasStartAndDestination(match.params)) {
    return (
      <>
        {screenReaderAlert}
        <SummaryPage
          content={content}
          match={match}
          loading={false}
          alertRef={alertRef}
          breakpoint={breakpoint}
          mapLayers={mapLayers}
          mapLayerOptions={mapLayerOptions}
          relayEnvironment={relayEnvironment}
        />
      </>
    );
  }
  const data = useLazyLoadQuery(
    planQuery,
    preparePlanParams(config, false)(match.params, match),
  );
  return (
    <>
      {screenReaderAlert}
      <SummaryPage
        plan={data?.viewer}
        serviceTimeRange={data?.serviceTimeRange}
        content={content}
        match={match}
        loading={false}
        alertRef={alertRef}
        breakpoint={breakpoint}
        mapLayers={mapLayers}
        mapLayerOptions={mapLayerOptions}
        relayEnvironment={relayEnvironment}
      />
    </>
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
