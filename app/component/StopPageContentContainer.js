import React from 'react';
import Relay from 'react-relay';
import some from 'lodash/some';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';

import DepartureListHeader from './DepartureListHeader';
import DepartureListContainer from './DepartureListContainer';

const DepartureListContainerWithProps = mapProps(props => ({
  stoptimes: props.stop.stoptimes,
  key: 'departures',
  className: 'stop-page momentum-scroll',
  routeLinks: true,
  infiniteScroll: true,
  isTerminal: !(props.params.stopId),
  rowClasses: 'padding-normal border-bottom',
}))(DepartureListContainer);

const StopPageContent = getContext({ breakpoint: React.PropTypes.string.isRequired })(props => (
  some(props.routes, 'fullscreenMap') && props.breakpoint !== 'large' ? null : (
    <div className="stop-page-content-wrapper">
      <DepartureListHeader />
      <DepartureListContainerWithProps {...props} />
    </div>
  )));

export default Relay.createContainer(StopPageContent, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        stoptimes: stoptimesForPatterns(startTime: $startTime, timeRange: $timeRange, numberOfDepartures: $numberOfDepartures) {
          ${DepartureListContainer.getFragment('stoptimes')}
        }
      }
    `,
  },

  initialVariables: {
    startTime: `${Math.floor(new Date().getTime() / 1000)}`,
    timeRange: 3600 * 12,
    numberOfDepartures: 100,
  },
});
