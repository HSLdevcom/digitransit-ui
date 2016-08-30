import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FavouriteRouteListContainerRoute } from '../../queries';
import FavouriteRouteListContainer from './FavouriteRouteListContainer';
import FavouriteLocationsContainer from './favourite-locations-container';
import NextDeparturesListHeader from '../departure/next-departures-list-header';
import NoFavouritesPanel from './NoFavouritesPanel';


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
    <div className="row favourite-locations-container">
      <FavouriteLocationsContainer />
    </div><NextDeparturesListHeader />
    <div className="scrollable momentum-scroll">
      <FavouriteRoutes routes={routes} />
    </div>
  </div>);


FavouritesPanel.propTypes = {
  routes: React.PropTypes.array.isRequired,
};

export default connectToStores(FavouritesPanel, ['FavouriteRoutesStore'], (context) =>
  ({
    routes: context.getStore('FavouriteRoutesStore').getRoutes(),
  })
);
