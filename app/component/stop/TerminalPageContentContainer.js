import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { FormattedMessage } from 'react-intl';
import DepartureListContainer from '../DepartureListContainer';
import Icon from '../Icon';
import ScrollableWrapper from '../ScrollableWrapper';
import { stationShape, errorShape, relayShape } from '../../util/shapes';

function TerminalPageContent({ station, relay, currentTime, error }) {
  if (!station && error) {
    throw error.message;
  }

  useEffect(() => {
    relay.refetch(oldVariables => {
      return { ...oldVariables, startTime: currentTime };
    });
  }, [currentTime, relay]);

  const { stoptimes } = station;
  // eslint-disable-next-line prefer-destructuring
  const stopsWithPatterns = station.stops.filter(
    stop => stop.patterns.length > 0,
  );
  const mode =
    stopsWithPatterns.length > 0
      ? stopsWithPatterns[0].patterns[0].route.mode
      : 'BUS';
  if (!stoptimes || stoptimes.length === 0) {
    return (
      <div className="stop-no-departures-container">
        <Icon img="icon_station" />
        <FormattedMessage id="no-departures" defaultMessage="No departures" />
      </div>
    );
  }
  const isStreetTrafficTerminal = () =>
    stopsWithPatterns.some(stop => stop.patterns[0].route.mode === 'BUS');
  return (
    <ScrollableWrapper>
      <div className="stop-page-departure-wrapper stop-scroll-container">
        <div
          className="departure-list-header row padding-vertical-normal"
          aria-hidden="true"
        >
          <span className="route-number-header">
            <FormattedMessage id="route" defaultMessage="Route" />
          </span>
          <span className="route-destination-header">
            <FormattedMessage id="destination" defaultMessage="Destination" />
          </span>
          <span className="time-header">
            <FormattedMessage id="leaving-at" defaultMessage="Leaves" />
          </span>
          <span className="track-header">
            <FormattedMessage
              id={
                mode === 'BUS' || isStreetTrafficTerminal()
                  ? 'platform'
                  : 'track'
              }
              defaultMessage={
                mode === 'BUS' || isStreetTrafficTerminal()
                  ? 'Platform'
                  : 'Track'
              }
            />
          </span>
        </div>
        <DepartureListContainer
          stoptimes={stoptimes}
          mode={mode}
          key="departures"
          className="stop-page"
          infiniteScroll
          isTerminal
          currentTime={currentTime}
          showPlatformCodes
          isTerminalPage
        />
      </div>
    </ScrollableWrapper>
  );
}

TerminalPageContent.propTypes = {
  station: stationShape.isRequired,
  relay: relayShape.isRequired,
  currentTime: PropTypes.number.isRequired,
  error: errorShape,
};

TerminalPageContent.defaultProps = {
  error: undefined,
};

const connectedComponent = createRefetchContainer(
  connectToStores(TerminalPageContent, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore').getCurrentTime(),
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
        stops {
          patterns {
            route {
              mode
            }
          }
        }
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
