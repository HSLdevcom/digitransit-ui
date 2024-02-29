import React, { useEffect, useState, lazy, Suspense } from 'react';
import { ReactRelayContext } from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import Loading from './Loading';
import withBreakpoint from '../util/withBreakpoint';
import { getMapLayerOptions } from '../util/mapLayerUtils';

const ItineraryPage = lazy(() => import('./ItineraryPage'));

const ItineraryPageWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => (
      <ItineraryPage {...props} relayEnvironment={environment} />
    )}
  </ReactRelayContext.Consumer>
));

const ItineraryPageWithStores = connectToStores(
  ItineraryPageWithBreakpoint,
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

export default function ItineraryPageContainer(props) {
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
      <ItineraryPageWithStores {...props} />
    </Suspense>
  );
}
