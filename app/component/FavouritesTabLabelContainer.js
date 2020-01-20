import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';
import mapProps from 'recompose/mapProps';

import FavouritesTabLabel from './FavouritesTabLabel';
import RoutesRoute from '../route/RoutesRoute';
import { RouteAlertsQuery } from '../util/alertQueries';
import { getActiveAlertSeverityLevel } from '../util/alertUtils';
import { isBrowser } from '../util/browser';

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

const FavouritesTabLabelRelayConnector = Relay.createContainer(
  mapProps(alertSeverityLevelMapper)(FavouritesTabLabel),
  {
    fragments: {
      routes: () => Relay.QL`
        fragment on Route @relay(plural:true) {
          ${RouteAlertsQuery}
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
          done ? (
            <FavouritesTabLabelRelayConnector {...props} {...rest} />
          ) : (
            <FavouritesTabLabel {...rest} />
          )
        }
      />
    );
  }
  return <div />;
}

FavouritesTabLabelContainer.propTypes = {
  routes: PropTypes.array.isRequired,
  currentTime: PropTypes.number.isRequired,
};

export default connectToStores(
  FavouritesTabLabelContainer,
  ['FavouriteStore', 'TimeStore'],
  context => ({
    routes: context.getStore('FavouriteStore').getRoutes(),
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  }),
);
