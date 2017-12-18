import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import { createRefetchContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import connectToStores from 'fluxible-addons-react/connectToStores';
import DepartureListContainer from './DepartureListContainer';
import DepartureListHeader from './DepartureListHeader';

class StopPageDepartureListContainer extends Component {
  static propTypes = {
    stop: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
      stoptimes: PropTypes.array.isRequired,
    }).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    currentTime: PropTypes.number.isRequired,
    params: PropTypes.oneOfType([
      PropTypes.shape({
        stopId: PropTypes.string.isRequired,
      }).isRequired,
      PropTypes.shape({
        terminalId: PropTypes.string.isRequired,
      }).isRequired,
    ]).isRequired,
  };

  componentDidMount() {
    this.props.relay.refetch({
      stopId: this.props.params.stopId || this.props.params.terminalId,
      startTime: this.props.currentTime,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.params.stopId !== this.props.params.stopId ||
      nextProps.params.terminalId !== this.props.params.terminalId ||
      nextProps.currentTime !== this.props.currentTime
    ) {
      nextProps.relay.refetch({
        stopId: nextProps.params.stopId || nextProps.params.terminalId,
        startTime: nextProps.currentTime,
      });
    }
  }

  render() {
    if (!this.props.stop || !this.props.stop.stoptimes) {
      return <div className="spinner-loader" />;
    }

    return (
      <Fragment>
        <DepartureListHeader />
        <DepartureListContainer
          stoptimes={this.props.stop.stoptimes}
          key="departures"
          className="stop-page momentum-scroll"
          routeLinks
          infiniteScroll
          isTerminal={!this.props.params.stopId}
          rowClasses="padding-normal border-bottom"
          currentTime={this.props.currentTime}
        />
      </Fragment>
    );
  }
}

const StopPageDepartures = createRefetchContainer(
  connectToStores(StopPageDepartureListContainer, ['TimeStore'], context => ({
    currentTime: context
      .getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    stop: graphql`
      fragment StopPageDepartures_stop on Stop
        @argumentDefinitions(
          startTime: { type: "Long" }
          timeRange: { type: "Int", defaultValue: 43200 } # 12 Hours
          numberOfDepartures: { type: "Int", defaultValue: 100 }
        ) {
        gtfsId
        stoptimes: stoptimesWithoutPatterns(
          startTime: $startTime
          timeRange: $timeRange
          numberOfDepartures: $numberOfDepartures
        ) {
          ...DepartureListContainer_stoptimes
        }
      }
    `,
  },
  graphql`
    query StopPageDeparturesQuery($stopId: String!, $startTime: Long!) {
      stop(id: $stopId) {
        ...StopPageDepartures_stop @arguments(startTime: $startTime)
      }
      station(id: $stopId) {
        ...StopPageDepartures_stop @arguments(startTime: $startTime)
      }
    }
  `,
);

export default StopPageDepartures;
