import PropTypes from 'prop-types';
import React from 'react';
import { createFragmentContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import some from 'lodash/some';
import mapProps from 'recompose/mapProps';
import getContext from 'recompose/getContext';

import StopPageTabContainer from './StopPageTabContainer';
import DepartureListHeader from './DepartureListHeader';
import DepartureListContainer from './DepartureListContainer';
import TimetableContainer from './TimetableContainer';
import Error404 from './404';

class StopPageContentOptions extends React.Component {
  static propTypes = {
    printUrl: PropTypes.string,
    departureProps: PropTypes.shape({
      stop: PropTypes.shape({
        stoptimes: PropTypes.array,
      }).isRequired,
    }).isRequired,
    date: PropTypes.string.isRequired,
    currentTime: PropTypes.number.isRequired,
    initialDate: PropTypes.string.isRequired,
    setDate: PropTypes.func.isRequired,
  };

  static defaultProps = {
    printUrl: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      showTab: 'right-now', // Show right-now as default
    };
  }

  onDateChange = ({ target }) => {
    this.props.setDate(target.value);
  };

  setTab = val => {
    this.setState({
      showTab: val,
    });
  };

  render() {
    // Currently shows only next departures, add Timetables
    return (
      <div className="stop-page-content-wrapper">
        <div>
          <StopPageTabContainer selectedTab={this.setTab} />
          <div className="stop-tabs-fillerline" />
          {this.state.showTab === 'right-now' && <DepartureListHeader />}
        </div>
        {this.state.showTab === 'right-now' && (
          <div className="stop-scroll-container momentum-scroll">
            <DepartureListContainerWithProps
              {...this.props.departureProps}
              currentTime={this.props.currentTime}
            />
          </div>
        )}
        {this.state.showTab === 'timetable' && (
          <TimetableContainer
            stop={this.props.departureProps.stop}
            date={this.props.date}
            propsForStopPageActionBar={{
              printUrl: this.props.printUrl,
              startDate: this.props.initialDate,
              selectedDate: this.props.date,
              onDateChange: this.onDateChange,
            }}
          />
        )}
      </div>
    );
  }
}

const DepartureListContainerWithProps = mapProps(props => ({
  stoptimes: props.stop.stoptimes,
  key: 'departures',
  className: 'stop-page momentum-scroll',
  routeLinks: true,
  infiniteScroll: true,
  isTerminal: !props.params.stopId,
  rowClasses: 'padding-normal border-bottom',
  currentTime: props.currentTime,
}))(DepartureListContainer);

const StopPageContent = getContext({ breakpoint: PropTypes.string.isRequired })(
  props =>
    some(props.routes, 'fullscreenMap') &&
    props.breakpoint !== 'large' ? null : (
      <StopPageContentOptions
        printUrl={props.stop.url}
        departureProps={props}
        initialDate={props.initialDate}
        setDate={props.setDate}
        date={props.date}
        currentTime={props.startTime}
      />
    ),
);

const StopPageContentOrEmpty = props => {
  if (props.stop) {
    return <StopPageContent {...props} />;
  }
  return <Error404 />;
};

StopPageContentOrEmpty.propTypes = {
  stop: PropTypes.shape({
    url: PropTypes.string,
  }).isRequired,
};

export default createFragmentContainer(StopPageContentOrEmpty, {
  stop: graphql`
    fragment StopPageContentContainer_stop on Stop {
      url
      stoptimes: stoptimesWithoutPatterns(
        startTime: $startTime
        timeRange: $timeRange
        numberOfDepartures: $numberOfDepartures
      ) {
        ...DepartureListContainer_stoptimes
      }
      ...TimetableContainer_stop
    }
  `,
});
