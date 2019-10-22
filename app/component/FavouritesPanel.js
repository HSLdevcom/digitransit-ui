import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';

import FavouriteRouteListContainer from './FavouriteRouteListContainer';
import Loading from './Loading';
import { dtLocationShape } from '../util/shapes';
import { isBrowser } from '../util/browser';

class FavouriteRouteListContainerRoute extends Relay.Route {
  static queries = {
    routes: (Component, variables) => Relay.QL`
      query {
        routes (ids:$ids) {
          ${Component.getFragment('routes', {
            ids: variables.ids,
          })}
    }}`,
  };

  static paramDefinitions = {
    ids: { required: true },
  };

  static routeName = 'FavouriteRouteRowRoute';
}

const FavouriteRoutes = ({ routes, origin }) => (
  <Relay.RootContainer
    Component={FavouriteRouteListContainer}
    forceFetch
    route={
      new FavouriteRouteListContainerRoute({
        ids: routes,
        origin,
      })
    }
    renderLoading={Loading}
  />
);

FavouriteRoutes.propTypes = {
  routes: PropTypes.array.isRequired,
  origin: dtLocationShape.isRequired,
};

const FavouritesPanel = () =>
  isBrowser && (
    <div className="frontpage-panel">

    </div>
  );

FavouritesPanel.propTypes = {
  routes: PropTypes.array.isRequired,
  origin: dtLocationShape.isRequired, // eslint-disable-line react/no-typos
  currentTime: PropTypes.number.isRequired,
  favouriteLocations: PropTypes.array,
  favouriteStops: PropTypes.array,
  breakpoint: PropTypes.string.isRequired,
};

export default connectToStores(
  ctx => (
    null
  ),
  [
    'FavouriteRoutesStore',
    'TimeStore',
    'FavouriteLocationStore',
    'FavouriteStopsStore',
  ],
  context => ({
    routes: context.getStore('FavouriteRoutesStore').getRoutes(),
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
    favouriteLocations: context
      .getStore('FavouriteLocationStore')
      .getLocations(),
    favouriteStops: context.getStore('FavouriteStopsStore').getStops(),
  }),
);
