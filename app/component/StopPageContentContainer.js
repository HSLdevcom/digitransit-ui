import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';

import DepartureListHeader from './DepartureListHeader';
import DepartureListContainer from './DepartureListContainer';
import Error404 from './404';
import Icon from './Icon';

class StopPageContent extends React.Component {
  static propTypes = {
    params: PropTypes.oneOfType([
      PropTypes.shape({ stopId: PropTypes.string.isRequired }).isRequired,
      PropTypes.shape({ terminalId: PropTypes.string.isRequired }).isRequired,
    ]).isRequired,
    stop: PropTypes.shape({
      stoptimes: PropTypes.array,
    }).isRequired,
    relay: PropTypes.shape({
      variables: PropTypes.shape({
        startTime: PropTypes.string.isRequired,
      }).isRequired,
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    currentTime: PropTypes.number.isRequired,
  };

  componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      relay.refetch({ startTime: String(currUnix) }, null);
    }
  }

  render() {
    if (!this.props.stop) {
      return <Error404 />;
    }

    const { stoptimes } = this.props.stop;
    if (!stoptimes || stoptimes.length === 0) {
      return (
        <div className="stop-no-departures-container">
          <Icon img="icon-icon_station" />
          <FormattedMessage id="no-departures" defaultMessage="No departures" />
        </div>
      );
    }
    return (
      <React.Fragment>
        <DepartureListHeader />
        <div className="stop-scroll-container momentum-scroll">
          <DepartureListContainer
            stoptimes={stoptimes}
            key="departures"
            className="stop-page momentum-scroll"
            routeLinks
            infiniteScroll
            isTerminal={!this.props.params.stopId}
            rowClasses="padding-normal border-bottom"
            currentTime={this.props.currentTime}
            showPlatformCodes
            isStopPage
          />
        </div>
      </React.Fragment>
    );
  }
}

const connectedComponent = createRefetchContainer(
  connectToStores(StopPageContent, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    stop: graphql`
      fragment StopPageContentContainer_stop on Stop
        @argumentDefinitions(
          startTime: { type: "String!", defaultValue: "0" }
          timeRange: { type: "Long!", defaultValue: 43200 }
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
);

export { connectedComponent as default, StopPageContent as Component };
