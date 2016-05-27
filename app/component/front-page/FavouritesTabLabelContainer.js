import React from 'react';
import Relay from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import mapProps from 'recompose/mapProps';
import some from 'lodash/some';
import flatten from 'lodash/flatten';
import RoutesRoute from '../../routes/RoutesRoute';
import FavouritesTabLabel from './FavouritesTabLabel';

const hasDisruption = (routes) =>
  some(flatten(routes.map(route => route.alerts.length > 0)));

const alertReducer = mapProps(({ routes, ...rest }) => ({
  hasDisruption: hasDisruption(routes),
  ...rest,
}));

const FavouritesTabLabelRelayConnector = Relay.createContainer(alertReducer(FavouritesTabLabel), {
  fragments: {
    routes: () => Relay.QL`
    fragment on Route @relay(plural:true) {
      alerts {
        id
      }
    }
 `,
  },
});

function FavouritesTabLabelContainer({ routes, ...rest }) {
  if (typeof window !== 'undefined') {
    return (
      <Relay.RootContainer
        Component={FavouritesTabLabelRelayConnector}
        route={new RoutesRoute({
          ids: routes,
        })}
        renderFetched={(data) =>
          <FavouritesTabLabelRelayConnector {...data} {...rest} />
        }
        renderLoading={() =>
          <FavouritesTabLabel {...rest} />
        }
      />);
  }
  return <div />;
}

FavouritesTabLabelContainer.propTypes = {
  routes: React.PropTypes.array.isRequired,
};

export default connectToStores(
  FavouritesTabLabelContainer,
  ['FavouriteRoutesStore'],
  (context) => ({
    routes: context.getStore('FavouriteRoutesStore').getRoutes(),
  }));
