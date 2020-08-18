import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';

import DepartureListHeader from './DepartureListHeader';
import DepartureListContainer from './DepartureListContainer';
import Error404 from './404';
import Icon from './Icon';

class TerminalPageContent extends React.Component {
  static propTypes = {
    station: PropTypes.shape({
      stoptimes: PropTypes.array,
    }).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    currentTime: PropTypes.number.isRequired,
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      relay.refetch(oldVariables => {
        return { ...oldVariables, startTime: currentTime };
      });
    }
  }

  render() {
    if (!this.props.station) {
      return <Error404 />;
    }

    const { stoptimes } = this.props.station;
    if (!stoptimes || stoptimes.length === 0) {
      return (
        <div className="stop-no-departures-container">
          <Icon img="icon-icon_station" />
          <FormattedMessage id="no-departures" defaultMessage="No departures" />
        </div>
      );
    }
    return (
      <div className="stop-page-departure-wrapper stop-scroll-container momentum-scroll">
        <DepartureListHeader />
        <div className="stop-scroll-container momentum-scroll">
          <DepartureListContainer
            stoptimes={stoptimes}
            key="departures"
            className="stop-page momentum-scroll"
            routeLinks
            infiniteScroll
            isTerminal
            currentTime={this.props.currentTime}
            showPlatformCodes
            isTerminalPage
          />
        </div>
      </div>
    );
  }
}

const connectedComponent = createRefetchContainer(
  connectToStores(TerminalPageContent, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    station: graphql`
      fragment TerminalPageContentContainer_station on Stop
        @argumentDefinitions(
          startTime: { type: "Long!", defaultValue: 0 }
          timeRange: { type: "Int!", defaultValue: 43200 }
          numberOfDepartures: { type: "Int!", defaultValue: 100 }
        ) {
        url
        stoptimes: stoptimesWithoutPatterns(
          startTime: $startTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
          omitCanceled: false
        ) {
          ...DepartureListContainer_stoptimes
        }
      }
    `,
  },
  graphql`
    query TerminalPageContentContainerQuery(
      $terminalId: String!
      $startTime: Long!
      $timeRange: Int!
      $numberOfDepartures: Int!
    ) {
      station(id: $terminalId) {
        ...TerminalPageContentContainer_station
          @arguments(
            startTime: $startTime
            timeRange: $timeRange
            numberOfDepartures: $numberOfDepartures
          )
      }
    }
  `,
);

export { connectedComponent as default, TerminalPageContent as Component };
