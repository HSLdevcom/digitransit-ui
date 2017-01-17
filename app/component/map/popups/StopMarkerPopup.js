import React from 'react';
import Relay from 'react-relay';
import StopCardContainer from '../../StopCardContainer';
import MarkerPopupBottom from '../MarkerPopupBottom';

const NUMBER_OF_DEPARTURES = 5;

function StopMarkerPopup(props) {
  const stop = props.stop || props.terminal;
  const terminal = props.terminal !== null;

  return (
    <div className="card">
      <StopCardContainer
        stop={stop}
        numberOfDepartures={(terminal ? 3 : 1) * NUMBER_OF_DEPARTURES}
        startTime={props.relay.variables.currentTime}
        isTerminal={terminal}
        timeRange={(terminal ? 1 : 12) * 60 * 60}
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

StopMarkerPopup.propTypes = {
  stop: React.PropTypes.object,
  terminal: React.PropTypes.object,
  relay: React.PropTypes.shape({
    variables: React.PropTypes.shape({
      currentTime: React.PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Relay.createContainer(StopMarkerPopup, {
  fragments: {
    stop: ({ currentTime }) => Relay.QL`
      fragment on Stop{
        gtfsId
        lat
        lon
        name
        ${StopCardContainer.getFragment('stop', {
          startTime: currentTime,
          timeRange: 24 * 60 * 60,
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
          timeRange: 60 * 60,
          // Terminals do not show arrivals, so we need some slack
          numberOfDepartures: NUMBER_OF_DEPARTURES * 3,
        })}
      }
    `,
  },
  initialVariables: {
    currentTime: 0,
  },
});
