import React from 'react';
import { ReactRelayContext } from 'react-relay';
import { connectToStores } from 'fluxible-addons-react';
import withBreakpoint from '../../util/withBreakpoint.jsx';
import { getMapLayerOptions } from '../../util/mapLayerUtils.js';
import ItineraryPage from './ItineraryPage.jsx';
import { ItineraryContextProvider } from './context/ItineraryContext.jsx';
import { useFavourites } from '../../hooks/FavouriteContext.jsx';
import { getFavouriteRouteGtfsIds } from '../../data/FavouriteData.js';

const ItineraryPageWithBreakpoint = withBreakpoint(props => (
  <ReactRelayContext.Consumer>
    {({ environment }) => {
      return (
        <ItineraryContextProvider relayEnvironment={environment}>
          <ItineraryPage {...props} relayEnvironment={environment} />
        </ItineraryContextProvider>
      );
    }}
  </ReactRelayContext.Consumer>
));

const ItineraryPageWithStores = connectToStores(
  ItineraryPageWithBreakpoint,
  ['MapLayerStore'],
  ({ getStore }) => ({
    getStore,
    mapLayers: getStore('MapLayerStore').getMapLayers({
      notThese: ['stop', 'citybike', 'vehicles', 'scooter'],
    }),
    mapLayerOptions: getMapLayerOptions({
      lockedMapLayers: ['vehicles', 'citybike', 'stop'],
      selectedMapLayers: ['vehicles'],
    }),
  }),
);

export default function ItineraryPageContainer(props) {
  const favourites = useFavourites();
  return (
    <ItineraryPageWithStores
      {...props}
      favouriteRoutes={getFavouriteRouteGtfsIds(favourites)}
    />
  );
}
