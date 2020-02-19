import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import connectToStores from 'fluxible-addons-react/connectToStores';

import DepartureListContainer from './DepartureListContainer';
import StopCard from './StopCard';

const StopCardContainer = connectToStores(
  StopCard,
  ['FavouriteStopsStore'],
  (context, props) => ({
    isTerminal: props.isTerminal,
    children: (
      <DepartureListContainer
        rowClasses="no-padding no-margin"
        stoptimes={props.stop.stoptimes}
        limit={props.limit}
        isTerminal={props.isTerminal}
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

export default createFragmentContainer(StopCardContainer, {
  stop: graphql`
    fragment StopCardContainer_stop on Stop
      @argumentDefinitions(
        startTime: { type: "Long" }
        timeRange: { type: "Int" }
        numberOfDepartures: { type: "Int", defaultValue: 5 }
      ) {
      gtfsId
      stoptimes: stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: $timeRange
        numberOfDepartures: $numberOfDepartures
        omitCanceled: false
      ) {
        ...DepartureListContainer_stoptimes
      }
      ...StopCardHeaderContainer_stop
    }
  `,
});
