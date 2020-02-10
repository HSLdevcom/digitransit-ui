import PropTypes from 'prop-types';
import React from 'react';
import Relay from 'react-relay/classic';
import connectToStores from 'fluxible-addons-react/connectToStores';

import StopCardHeaderContainer from './StopCardHeaderContainer';
import DepartureListContainer from './DepartureListContainer';
import StopCard from './StopCard';

const StopCardContainer = connectToStores(
  StopCard,
  ['FavouriteStore'],
  (context, props) => ({
    isTerminal: props.isTerminal,
    children: (
      <DepartureListContainer
        rowClasses="no-padding no-margin"
        stoptimes={props.stop.stoptimes}
        limit={props.limit}
        isTerminal={props.isTerminal}
        currentTime={props.relay.variables.startTime}
        isPopUp={props.isPopUp}
        showPlatformCodes
      />
    ),
  }),
);

StopCardContainer.contextTypes = {
  executeAction: PropTypes.func.isRequired,
  getStore: PropTypes.func.isRequired,
};

export default Relay.createContainer(StopCardContainer, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop{
        gtfsId
        stoptimes: stoptimesWithoutPatterns(
          startTime: $startTime,
          timeRange: $timeRange,
          numberOfDepartures: $numberOfDepartures,
          omitCanceled: false
        ) {
          ${DepartureListContainer.getFragment('stoptimes')}
        }
        ${StopCardHeaderContainer.getFragment('stop')}
      }
    `,
  },
  initialVariables: {
    startTime: 0,
    timeRange: 12 * 60 * 60,
    numberOfDepartures: 5,
  },
});
