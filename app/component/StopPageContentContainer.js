import React from 'react';
import Relay from 'react-relay';
import some from 'lodash/some';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';
import StopPageTabContainer from './StopPageTabContainer';
import DepartureListHeader from './DepartureListHeader';
import DepartureListContainer from './DepartureListContainer';
import StopPageActionBar from './StopPageActionBar';
import Error404 from './404';

class StopPageContentOptions extends React.Component {

  static propTypes = {
    selectedTab: React.PropTypes.func,
    breakPoint: React.PropTypes.string,
    printUrl: React.PropTypes.string,
    departureProps: React.PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      showTab: 'right-now', // Show right-now as default
    };
  }

  setTab = (val) => {
    this.setState({
      showTab: val,
    });
  }

  render() {
    // Currently shows only next departures, add Timetables 
    return (<div className="stop-page-content-wrapper">
      <StopPageTabContainer selectedTab={this.setTab} />
      {this.state.showTab === 'right-now' &&
      <div style={{ height: '90%' }}>
        <DepartureListHeader />
        <div className="stop-scroll-container">
          <DepartureListContainerWithProps {...this.props.departureProps} />
        </div>
        </div>
      }
      {this.state.showTab === 'timetable' &&
      <StopPageActionBar breakpoint={this.props.breakPoint} printUrl={this.props.printUrl} />
      }
    </div>);
  }
}

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
    <StopPageContentOptions
      breakPoint={props.breakpoint}
      printUrl={props.stop.url}
      departureProps={props}
    />
  )));

const StopPageContentOrEmpty = (props) => {
  if (props.stop) {
    return <StopPageContent {...props} />;
  }
  return <Error404 />;
};

StopPageContentOrEmpty.propTypes = {
  stop: React.PropTypes.object,
};

export default Relay.createContainer(StopPageContentOrEmpty, {
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
