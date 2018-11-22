import React from 'react';
import Relay, { Route } from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';
import withState from 'recompose/withState';
import moment from 'moment';
import StopPageContentContainer from './StopPageContentContainer';

const initialDate = moment().format('YYYYMMDD');

class TerminalPageContainerRoute extends Route {
  static queries = {
    stop: (RelayComponent, variables) => Relay.QL`
      query {
        station(id: $terminalId) {
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

const TerminalPageRootContainer = routeProps => (
  <Relay.Renderer
    Container={StopPageContentContainer}
    queryConfig={
      new TerminalPageContainerRoute({
        terminalId: routeProps.params.terminalId,
        ...routeProps,
      })
    }
    environment={Relay.Store}
    render={({ props, done }) =>
      done ? (
        <StopPageContentContainer
          {...props}
          initialDate={initialDate}
          setDate={routeProps.setDate}
        />
      ) : (
        undefined
      )
    }
  />
);

const TerminalPageContainerWithState = withState(
  'date',
  'setDate',
  initialDate,
)(TerminalPageRootContainer);

export default connectToStores(
  TerminalPageContainerWithState,
  ['TimeStore', 'FavouriteStopsStore'],
  ({ getStore }) => ({
    startTime: getStore('TimeStore')
      .getCurrentTime()
      .unix(),
    timeRange: 3600,
    numberOfDepartures: 100,
  }),
);
