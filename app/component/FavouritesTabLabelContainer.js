import PropTypes from 'prop-types';
import React from 'react';
import { QueryRenderer } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import { graphql } from 'relay-runtime';
import connectToStores from 'fluxible-addons-react/connectToStores';
import some from 'lodash/some';
import flatten from 'lodash/flatten';
import FavouritesTabLabel from './FavouritesTabLabel';
import { isBrowser } from '../util/browser';

const hasDisruption = routes =>
  some(
    flatten(
      routes.map(route => route && route.alerts && route.alerts.length > 0),
    ),
  );

function FavouritesTabLabelContainer({ routes, ...rest }) {
  if (isBrowser) {
    return (
      <QueryRenderer
        environment={Store}
        query={graphql`
          query FavouritesTabLabelContainerQuery($ids: [String!]) {
            routes(ids: $ids) {
              alerts {
                id
              }
            }
          }
        `}
        variables={{ ids: routes }}
        render={({ props }) => (
          <FavouritesTabLabel
            {...rest}
            hasDisruption={props && props.routes && hasDisruption(props.routes)}
          />
        )}
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
