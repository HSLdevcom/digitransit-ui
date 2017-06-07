import React from 'react';
import Relay from 'react-relay';
import some from 'lodash/some';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';

import StopPageTabContainer from './StopPageTabContainer';
import DepartureListHeader from './DepartureListHeader';
import DepartureListContainer from './DepartureListContainer';
import StopPageActionBar from './StopPageActionBar';
import TimetableContainer from './TimetableContainer';
import Error404 from './404';

class StopPageContentOptions extends React.Component {

  static propTypes = {
    printUrl: React.PropTypes.string,
    departureProps: React.PropTypes.shape({
      stop: React.PropTypes.shape({
        stoptimes: React.PropTypes.array,
      }).isRequired,
    }).isRequired,
    relay: React.PropTypes.shape({
      variables: React.PropTypes.shape({
        date: React.PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    initialDate: React.PropTypes.string.isRequired,
    setDate: React.PropTypes.func.isRequired,
  };

  static defaultProps = {
    printUrl: null,
  }

  constructor(props) {
    super(props);
    this.state = {
      showTab: 'right-now', // Show right-now as default
    };
  }

  onDateChange = ({ target }) => {
    this.props.setDate(target.value);
  };

  setTab = (val) => {
    this.setState({
      showTab: val,
    });
  }

  render() {
    // Currently shows only next departures, add Timetables
    return (<div className="stop-page-content-wrapper">
      <div>
        <StopPageTabContainer selectedTab={this.setTab} />
        <div className="stop-tabs-fillerline" />
        {this.state.showTab === 'right-now' && <DepartureListHeader />}
      </div>
      {this.state.showTab === 'right-now' &&
        <div className="stop-scroll-container momentum-scroll">
          <DepartureListContainerWithProps {...this.props.departureProps} />
        </div>
      }
      {this.state.showTab === 'timetable' &&
      <div className="momentum-scroll">
        <StopPageActionBar
          printUrl={this.props.printUrl}
          startDate={this.props.initialDate}
          selectedDate={this.props.relay.variables.date}
          onDateChange={this.onDateChange}
        />
        <TimetableContainer
          stop={this.props.departureProps.stop}
          date={this.props.relay.variables.date}
        />
      </div>
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
      printUrl={props.stop.url}
      departureProps={props}
      relay={props.relay}
      initialDate={props.initialDate}
      setDate={props.setDate}
    />
  )));

const StopPageContentOrEmpty = (props) => {
  if (props.stop) {
    return <StopPageContent {...props} />;
  }
  return <Error404 />;
};

StopPageContentOrEmpty.propTypes = {
  stop: React.PropTypes.shape({
    url: React.PropTypes.string,
  }).isRequired,
};

export default Relay.createContainer(StopPageContentOrEmpty, {
  fragments: {
    stop: ({ date }) => Relay.QL`
      fragment on Stop {
        url
        stoptimes: stoptimesWithoutPatterns(startTime: $startTime, timeRange: $timeRange, numberOfDepartures: $numberOfDepartures) {
          ${DepartureListContainer.getFragment('stoptimes')}
        }
        ${TimetableContainer.getFragment('stop', { date })}
      }
    `,
  },

  initialVariables: {
    startTime: 0,
    timeRange: 3600 * 12,
    numberOfDepartures: 100,
    date: null,
  },
});
