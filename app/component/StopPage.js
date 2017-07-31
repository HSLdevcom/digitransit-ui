import React from 'react';
import Relay, { Route } from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';
import withState from 'recompose/withState';
import moment from 'moment';
import StopPageContentContainer from './StopPageContentContainer';

const initialDate = moment().format('YYYYMMDD');

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

const StopPageRootContainer = routeProps =>
  <Relay.Renderer
    Container={StopPageContentContainer}
    queryConfig={
      new StopPageContainerRoute({
        stopId: routeProps.params.stopId,
        ...routeProps,
      })
    }
    environment={Relay.Store}
    render={({ props, done }) =>
      done
        ? <StopPageContentContainer
            {...props}
            initialDate={initialDate}
            setDate={routeProps.setDate}
          />
        : undefined}
  />;

const StopPageContainerWithState = withState('date', 'setDate', initialDate)(
  StopPageRootContainer,
);

export default connectToStores(
  StopPageContainerWithState,
  ['TimeStore', 'FavouriteStopsStore'],
  ({ getStore }) => ({
    startTime: getStore('TimeStore').getCurrentTime().unix(),
    timeRange: 3600 * 12,
    numberOfDepartures: 100,
  }),
);
