import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import PopupMock from './PopupMock';
import MarkerPopupBottom from '../MarkerPopupBottom';
import StopCardContainer from '../../StopCardContainer';
import ComponentUsageExample from '../../ComponentUsageExample';

import mockData from './StopMarkerPopup.mockdata';

const NUMBER_OF_DEPARTURES = 5;

class StopMarkerPopup extends React.PureComponent {
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      relay.refetch(oldVariables => {
        return { ...oldVariables, startTime: currUnix };
      });
    }
  }

  render() {
    const { currentTime, stop } = this.props;

    return (
      <div className="card">
        <StopCardContainer
          stop={stop}
          currentTime={currentTime}
          limit={NUMBER_OF_DEPARTURES}
          isPopUp
          className="card-padding"
        />
        <MarkerPopupBottom
          location={{
            address: stop.name,
            lat: stop.lat,
            lon: stop.lon,
          }}
        />
      </div>
    );
  }
}

StopMarkerPopup.propTypes = {
  stop: PropTypes.object,
  currentTime: PropTypes.number.isRequired,
  relay: PropTypes.shape({
    refetch: PropTypes.func.isRequired,
  }).isRequired,
};

const StopMarkerPopupContainer = createRefetchContainer(
  connectToStores(StopMarkerPopup, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    stop: graphql`
      fragment StopMarkerPopup_stop on Stop
        @argumentDefinitions(
          startTime: { type: "Long!", defaultValue: 0 }
          timeRange: { type: "Long!", defaultValue: 43200 }
          numberOfDepartures: { type: "Int!", defaultValue: 5 }
        ) {
        gtfsId
        lat
        lon
        name
        ...StopCardContainer_stop
          @arguments(
            startTime: $startTime
            timeRange: $timeRange
            numberOfDepartures: $numberOfDepartures
          )
      }
    `,
  },
  graphql`
    query StopMarkerPopupQuery(
      $stopId: String!
      $startTime: Long!
      $timeRange: Long!
      $numberOfDepartures: Int!
    ) {
      stop(id: $stopId) {
        ...StopMarkerPopup_stop
          @arguments(
            startTime: $startTime
            timeRange: $timeRange
            numberOfDepartures: $numberOfDepartures
          )
      }
    }
  `,
);

StopMarkerPopupContainer.displayName = 'StopMarkerPopup';

const getTimeProps = currentTime => ({
  currentTime,
  relay: {
    refetch: () => {},
  },
});

StopMarkerPopupContainer.description = () => (
  <div>
    <ComponentUsageExample description="empty">
      <PopupMock size="small">
        <StopMarkerPopup
          {...mockData.empty}
          {...getTimeProps(moment().unix())}
        />
      </PopupMock>
    </ComponentUsageExample>
    <ComponentUsageExample description="basic">
      <PopupMock>
        <StopMarkerPopup
          {...mockData.basic}
          {...getTimeProps(mockData.currentTime)}
        />
      </PopupMock>
    </ComponentUsageExample>
    <ComponentUsageExample description="withInfo">
      <PopupMock size="small">
        <StopMarkerPopup
          stop={{
            ...mockData.empty.stop,
            alerts: [
              {
                alertSeverityLevel: 'INFO',
              },
            ],
          }}
          {...getTimeProps(moment().unix())}
        />
      </PopupMock>
    </ComponentUsageExample>
    <ComponentUsageExample description="withDisruption">
      <PopupMock size="small">
        <StopMarkerPopup
          stop={{
            ...mockData.empty.stop,
            alerts: [
              {
                alertSeverityLevel: 'WARNING',
              },
            ],
          }}
          {...getTimeProps(moment().unix())}
        />
      </PopupMock>
    </ComponentUsageExample>
  </div>
);

export default StopMarkerPopupContainer;
