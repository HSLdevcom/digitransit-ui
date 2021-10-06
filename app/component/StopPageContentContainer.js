import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import { routerShape, RedirectException } from 'found';

import DepartureListContainer from './DepartureListContainer';
import Loading from './Loading';
import Icon from './Icon';
import ScrollableWrapper from './ScrollableWrapper';
import { isBrowser } from '../util/browser';
import { PREFIX_STOPS } from '../util/path';

class StopPageContent extends React.Component {
  static propTypes = {
    stop: PropTypes.shape({
      stoptimes: PropTypes.array,
    }).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    currentTime: PropTypes.number.isRequired,
    error: PropTypes.object,
    router: routerShape.isRequired,
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

  componentDidMount() {
    // Throw error in client side if relay fails to fetch data
    if (this.props.error) {
      throw this.props.error.message;
    }
  }

  render() {
    // Render something in client side to clear SSR
    if (isBrowser && this.props.error) {
      return <Loading />;
    }

    if (!this.props.stop && !this.props.error) {
      /* In this case there is little we can do
       * There is no point continuing rendering as it can only
       * confuse user. Therefore redirect to Stops page */
      if (isBrowser) {
        this.props.router.replace(`/${PREFIX_STOPS}`);
      } else {
        throw new RedirectException(`/${PREFIX_STOPS}`);
      }
      return null;
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
      <ScrollableWrapper>
        <div className="stop-page-departure-wrapper stop-scroll-container">
          <DepartureListContainer
            stoptimes={stoptimes}
            key="departures"
            className="stop-page momentum-scroll"
            routeLinks
            infiniteScroll
            currentTime={this.props.currentTime}
            isStopPage
          />
        </div>
      </ScrollableWrapper>
    );
  }
}

const connectedComponent = createRefetchContainer(
  connectToStores(StopPageContent, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime().unix(),
  })),
  {
    stop: graphql`
      fragment StopPageContentContainer_stop on Stop
      @argumentDefinitions(
        startTime: { type: "Long!", defaultValue: 0 }
        timeRange: { type: "Int!", defaultValue: 864000 }
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
    query StopPageContentContainerQuery(
      $stopId: String!
      $startTime: Long!
      $timeRange: Int!
      $numberOfDepartures: Int!
    ) {
      stop(id: $stopId) {
        ...StopPageContentContainer_stop
        @arguments(
          startTime: $startTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
        )
      }
    }
  `,
);

export { connectedComponent as default, StopPageContent as Component };
