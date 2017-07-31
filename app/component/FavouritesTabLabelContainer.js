import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';
import mapProps from 'recompose/mapProps';
import some from 'lodash/some';
import flatten from 'lodash/flatten';
import RoutesRoute from '../route/RoutesRoute';
import FavouritesTabLabel from './FavouritesTabLabel';
import { isBrowser } from '../util/browser';

const hasDisruption = routes =>
  some(flatten(routes.map(route => route.alerts.length > 0)));

const alertReducer = mapProps(({ routes, ...rest }) => ({
  hasDisruption: hasDisruption(routes),
  ...rest,
}));

const FavouritesTabLabelRelayConnector = Relay.createContainer(
  alertReducer(FavouritesTabLabel),
  {
    fragments: {
      routes: () => Relay.QL`
    fragment on Route @relay(plural:true) {
      alerts {
        id
      }
    }
 `,
    },
  },
);

function FavouritesTabLabelContainer({ routes, ...rest }) {
  if (isBrowser) {
    return (
      <Relay.Renderer
        Container={FavouritesTabLabelRelayConnector}
        queryConfig={new RoutesRoute({ ids: routes })}
        environment={Relay.Store}
        render={({ done, props }) =>
          done
            ? <FavouritesTabLabelRelayConnector {...props} {...rest} />
            : <FavouritesTabLabel {...rest} />}
      />
    );
  }
  return <div />;
}

FavouritesTabLabelContainer.propTypes = {
  routes: PropTypes.array.isRequired,
};

export default connectToStores(
  FavouritesTabLabelContainer,
  ['FavouriteRoutesStore'],
  context => ({
    routes: context.getStore('FavouriteRoutesStore').getRoutes(),
  }),
);
