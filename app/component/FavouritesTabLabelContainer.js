import PropTypes from 'prop-types';
import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';
import some from 'lodash/some';
import flatten from 'lodash/flatten';
import FavouritesTabLabel from './FavouritesTabLabel';

const hasDisruption = routes =>
  some(flatten(routes.map(route => route.alerts.length > 0)));

function FavouritesTabLabelContainer({ routes, ...rest }) {
  return (
    <QueryRenderer
      cacheConfig={{ force: true, poll: 30 * 1000 }}
      query={graphql`
        query FavouritesTabLabelContainerQuery($ids: [String]) {
          routes(ids: $ids) {
            alerts {
              id
            }
          }
        }
      `}
      variables={{ ids: routes }}
      environment={Store}
      render={({ props }) =>
        <FavouritesTabLabel
          hasDisruption={props && hasDisruption(props.routes)}
          {...rest}
        />}
    />
  );
}

FavouritesTabLabelContainer.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
};

export default connectToStores(
  FavouritesTabLabelContainer,
  ['FavouriteRoutesStore'],
  context => ({
    routes: context.getStore('FavouriteRoutesStore').getRoutes(),
  }),
);
