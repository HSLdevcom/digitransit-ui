import React from 'react';
import Relay, { Route } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import StopPageContentContainer from './StopPageContentContainer';

class StopPageContainerRoute extends Route {
  static queries = {
    stop: (RelayComponent, variables) => Relay.QL`
      query {
        stop(id: $stopId) {
          ${RelayComponent.getFragment('stop', variables)}
        }
      }
    `,
  };
  static paramDefinitions = {
    startTime: { required: true },
    timeRange: { required: true },
    numberOfDepartures: { required: true },
  };
  static routeName = 'StopPageContainerRoute';
}

const StopPageRootContainer = routeProps => (
  <Relay.Renderer
    Container={StopPageContentContainer}
    queryConfig={new StopPageContainerRoute({
      stopId: routeProps.params.stopId,
      ...routeProps,
    })}
    environment={Relay.Store}
  />
);

export default connectToStores(StopPageRootContainer, ['TimeStore', 'FavouriteStopsStore'],
  ({ getStore }) => ({
    startTime: getStore('TimeStore').getCurrentTime().unix(),
    timeRange: 3600 * 12,
    numberOfDepartures: 100,
  }));
