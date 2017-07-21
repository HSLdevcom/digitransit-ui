import React from 'react';
import { QueryRenderer, graphql } from 'react-relay/compat';
import { Store } from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';
import withState from 'recompose/withState';
import moment from 'moment';
import StopPageContentContainer from './StopPageContentContainer';

const TerminalPageRootContainer = routeProps =>
  <QueryRenderer
    query={graphql.experimental`
      query TerminalPageQuery(
        $terminalId: String!
        $startTime: Long!
        $timeRange: Int
        $numberOfDepartures: Int
        $date: String
      ) {
        stop: station(id: $terminalId) {
          ...StopPageContentContainer_stop
            @arguments(
              #startTime: $startTime
              timeRange: $timeRange
              numberOfDepartures: $numberOfDepartures
              date: $date
            )
        }
      }
    `}
    variables={{
      terminalId: routeProps.params.terminalId,
      startTime: routeProps.startTime,
      date: routeProps.date,
      timeRange: 60 * 60,
      numberOfDepartures: 100,
    }}
    environment={Store}
    render={({ props }) =>
      props &&
      <StopPageContentContainer
        {...props}
        {...routeProps}
        initialDate={moment().format('YYYYMMDD')}
        setDate={routeProps.setDate}
      />}
  />;

const TerminalPageContainerWithState = withState(
  'date',
  'setDate',
  moment().format('YYYYMMDD'),
)(TerminalPageRootContainer);

export default connectToStores(
  TerminalPageContainerWithState,
  ['TimeStore', 'FavouriteStopsStore'],
  ({ getStore }) => ({
    startTime: getStore('TimeStore').getCurrentTime().unix(),
  }),
);
