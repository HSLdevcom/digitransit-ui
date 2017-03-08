import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import FavouriteRouteListContainer from './FavouriteRouteListContainer';
import FavouriteLocationsContainer from './FavouriteLocationsContainer';
import NextDeparturesListHeader from './NextDeparturesListHeader';
import NoFavouritesPanel from './NoFavouritesPanel';

class FavouriteRouteListContainerRoute extends Relay.Route {
  static queries = {
    routes: (Component, variables) => Relay.QL`
      query {
        routes (ids:$ids) {
          ${Component.getFragment('routes', {
            ids: variables.ids,
          },
        )
      }
    }}`,
  };
  static paramDefinitions = {
    ids: { required: true },
  };
  static routeName = 'FavouriteRouteRowRoute';
}

const FavouriteRoutes = ({ routes }) => {
  if (routes.length > 0) {
    return (<Relay.RootContainer
      Component={FavouriteRouteListContainer}
      forceFetch route={new FavouriteRouteListContainerRoute({
        ids: routes,
      })} renderLoading={() => (
        <div className="spinner-loader" />
      )}
    />);
  }
  return <NoFavouritesPanel />;
};

FavouriteRoutes.propTypes = {
  routes: React.PropTypes.array.isRequired,
};

const FavouritesPanel = ({
  routes,
}) => (
  <div className="frontpage-panel">
    <FavouriteLocationsContainer />
    <NextDeparturesListHeader />
    <div className="scrollable momentum-scroll favourites">
      <FavouriteRoutes routes={routes} />
    </div>
  </div>);

FavouritesPanel.propTypes = {
  routes: React.PropTypes.array.isRequired,
};

export default connectToStores(FavouritesPanel, ['FavouriteRoutesStore'], context =>
  ({
    routes: context.getStore('FavouriteRoutesStore').getRoutes(),
  }),
);
