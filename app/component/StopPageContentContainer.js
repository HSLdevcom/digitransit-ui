import React from 'react';
import Relay from 'react-relay';
import some from 'lodash/some';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import DepartureListHeader from './DepartureListHeader';
import DepartureListContainer from './DepartureListContainer';
import StopPageActionBar from './StopPageActionBar';

const DepartureListContainerWithProps = mapProps(props => ({
  stoptimes: props.stop.stoptimes,
  key: 'departures',
  className: 'stop-page momentum-scroll',
  routeLinks: true,
  infiniteScroll: true,
  isTerminal: !(props.params.stopId),
  rowClasses: 'padding-normal border-bottom',
  currentTime: props.relay.variables.startTime,
}))(DepartureListContainer);

const StopPageContent = getContext({ breakpoint: React.PropTypes.string.isRequired })(props => (
  some(props.routes, 'fullscreenMap') && props.breakpoint !== 'large' ? null : (
    <div className="stop-page-content-wrapper">
      <StopPageActionBar breakpoint={props.breakpoint} printUrl={props.stop.url} />
      <DepartureListHeader />
      <DepartureListContainerWithProps {...props} />
    </div>
  )));


export default Relay.createContainer(StopPageContent, {
  fragments: {
    stop: () => Relay.QL`
      fragment on Stop {
        url
        stoptimes: stoptimesWithoutPatterns(startTime: $startTime, timeRange: $timeRange, numberOfDepartures: $numberOfDepartures) {
          ${DepartureListContainer.getFragment('stoptimes')}
        }
      }
    `,
  },

  initialVariables: {
    startTime: 0,
    timeRange: 3600 * 12,
    numberOfDepartures: 100,
  },
});
