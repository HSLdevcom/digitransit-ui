import PropTypes from 'prop-types';
import React from 'react';
import { graphql, QueryRenderer } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import mapProps from 'recompose/mapProps';

import FavouritesTabLabel from './FavouritesTabLabel';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import getRelayEnvironment from '../util/getRelayEnvironment';

export const alertSeverityLevelMapper = ({ routes, currentTime, ...rest }) => {
  const alertSeverityLevel = getActiveAlertSeverityLevel(
    Array.isArray(routes) &&
      routes
        .map(
          route =>
            (route && (Array.isArray(route.alerts) && route.alerts)) || [],
        )
        .reduce((a, b) => a.concat(b), []),
    currentTime,
  );
  return {
    alertSeverityLevel,
    ...rest,
  };
};

const FavouritesTabLabelWithMappedProps = mapProps(alertSeverityLevelMapper)(
  FavouritesTabLabel,
);

function FavouritesTabLabelContainer({ routes, relayEnvironment, ...rest }) {
  return (
    <QueryRenderer
      cacheConfig={{ force: true, poll: 30 * 1000 }}
      query={graphql`
        query FavouritesTabLabelContainerQuery($ids: [String]) {
          routes(ids: $ids) {
            alerts {
              alertSeverityLevel
              effectiveEndDate
              effectiveStartDate
              trip {
                pattern {
                  code
                }
              }
            }
          }
        }
      `}
      variables={{ ids: routes }}
      environment={relayEnvironment}
      render={() => <FavouritesTabLabelWithMappedProps {...rest} />}
    />
  );
}

FavouritesTabLabelContainer.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  relayEnvironment: PropTypes.object.isRequired,
};

export default connectToStores(
  getRelayEnvironment(FavouritesTabLabelContainer),
  ['FavouriteRoutesStore', 'TimeStore'],
  context => ({
    routes: context.getStore('FavouriteRoutesStore').getRoutes(),
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  }),
);
