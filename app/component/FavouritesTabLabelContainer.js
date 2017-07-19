import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { Renderer, Store } from 'react-relay/classic';
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

const FavouritesTabLabelRelayConnector = createFragmentContainer(
  alertReducer(FavouritesTabLabel),
  {
    routes: graphql`
      fragment FavouritesTabLabelContainer_routes on Route
        @relay(plural: true) {
        alerts {
          id
        }
      }
    `,
  },
);

function FavouritesTabLabelContainer({ routes, ...rest }) {
  if (isBrowser) {
    return (
      <Renderer
        Container={FavouritesTabLabelRelayConnector}
        queryConfig={new RoutesRoute({ ids: routes })}
        environment={Store}
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
