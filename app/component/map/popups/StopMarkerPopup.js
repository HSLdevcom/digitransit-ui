import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';

import PopupMock from './PopupMock';
import MarkerPopupBottom from '../MarkerPopupBottom';
import StopCardContainer from '../../StopCardContainer';
import ComponentUsageExample from '../../ComponentUsageExample';

import mockData from './StopMarkerPopup.mockdata';

const NUMBER_OF_DEPARTURES = 5;
const STOP_TIME_RANGE = 12 * 60 * 60;
const TERMINAL_TIME_RANGE = 60 * 60;

class StopMarkerPopup extends React.PureComponent {
  componentWillReceiveProps({ relay, currentTime }) {
    const currUnix = this.props.currentTime;
    if (currUnix !== currentTime) {
      relay.setVariables({ currentTime: currUnix });
    }
  }
  render() {
    const stop = this.props.stop || this.props.terminal;
    const terminal = this.props.terminal !== null;

    return (
      <div className="card">
        <StopCardContainer
          stop={stop}
          numberOfDepartures={(terminal ? 3 : 1) * NUMBER_OF_DEPARTURES}
          startTime={this.props.relay.variables.currentTime}
          isTerminal={terminal}
          timeRange={terminal ? TERMINAL_TIME_RANGE : STOP_TIME_RANGE}
          limit={NUMBER_OF_DEPARTURES}
          className="padding-small cursor-pointer"
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
  terminal: PropTypes.object,
  currentTime: PropTypes.number.isRequired,
  relay: PropTypes.shape({
    variables: PropTypes.shape({
      currentTime: PropTypes.number.isRequired,
    }).isRequired,
    setVariables: PropTypes.func.isRequired,
  }).isRequired,
};

const StopMarkerPopupContainer = Relay.createContainer(
  connectToStores(StopMarkerPopup, ['TimeStore'], ({ getStore }) => ({
    currentTime: getStore('TimeStore')
      .getCurrentTime()
      .unix(),
  })),
  {
    fragments: {
      stop: ({ currentTime }) => Relay.QL`
      fragment on Stop{
        gtfsId
        lat
        lon
        name
        ${StopCardContainer.getFragment('stop', {
          startTime: currentTime,
          timeRange: STOP_TIME_RANGE,
          numberOfDepartures: NUMBER_OF_DEPARTURES,
        })}
      }
    `,
      terminal: ({ currentTime }) => Relay.QL`
      fragment on Stop{
        gtfsId
        lat
        lon
        name
        ${StopCardContainer.getFragment('stop', {
          startTime: currentTime,
          timeRange: TERMINAL_TIME_RANGE,
          // Terminals do not show arrivals, so we need some slack
          numberOfDepartures: NUMBER_OF_DEPARTURES * 3,
        })}
      }
    `,
    },
    initialVariables: {
      currentTime: 0,
    },
  },
);

StopMarkerPopupContainer.displayName = 'StopMarkerPopup';

StopMarkerPopupContainer.description = () => (
  <div>
    <ComponentUsageExample description="empty">
      <PopupMock size="small">
        <StopMarkerPopupContainer
          {...mockData.empty}
          currentTime={moment().unix()}
        />
      </PopupMock>
    </ComponentUsageExample>
    <ComponentUsageExample description="basic">
      <PopupMock>
        <StopMarkerPopupContainer
          {...mockData.basic}
          currentTime={mockData.currentTime}
        />
      </PopupMock>
    </ComponentUsageExample>
  </div>
);

export default StopMarkerPopupContainer;
