import React from 'react';
import Relay from 'react-relay';
import StopCardContainer from '../../StopCardContainer';
import MarkerPopupBottom from '../MarkerPopupBottom';

function StopMarkerPopup(props) {
  const stop = props.stop || props.terminal;
  const terminal = props.terminal !== null;

  return (
    <div className="card">
      <StopCardContainer
        stop={stop}
        departures={5}
        date={props.relay.variables.date}
        isTerminal={terminal}
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
      date: React.PropTypes.string.isRequired,
    }).isRequired,
  }).isRequired,
};

export default Relay.createContainer(StopMarkerPopup, {
  fragments: {
    stop: ({ date }) => Relay.QL`
      fragment on Stop{
        gtfsId
        lat
        lon
        name
        ${StopCardContainer.getFragment('stop', { date })}
      }
    `,
    terminal: ({ date }) => Relay.QL`
      fragment on Stop{
        gtfsId
        lat
        lon
        name
        ${StopCardContainer.getFragment('stop', { date })}
      }
    `,
  },
  initialVariables: {
    date: null,
  },
});
