import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { matchShape } from 'found';

import DepartureListHeader from './DepartureListHeader';
import DepartureListContainer from './DepartureListContainer';
import Error404 from './404';
import Icon from './Icon';

class StopPageContent extends React.Component {
  static propTypes = {
    match: matchShape.isRequired,
    stop: PropTypes.shape({
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
            isTerminal={!this.props.match.params.stopId}
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
);

export { connectedComponent as default, StopPageContent as Component };
