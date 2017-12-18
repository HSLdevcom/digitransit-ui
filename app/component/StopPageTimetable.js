import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createRefetchContainer } from 'react-relay/compat';
import { graphql } from 'relay-runtime';
import connectToStores from 'fluxible-addons-react/connectToStores';
import TimetableContainer from './TimetableContainer';

class StopPageTimetableContainer extends Component {
  static propTypes = {
    stop: PropTypes.shape({
      gtfsId: PropTypes.string.isRequired,
    }).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    date: PropTypes.string.isRequired,
    params: PropTypes.oneOfType([
      PropTypes.shape({
        stopId: PropTypes.string.isRequired,
      }).isRequired,
      PropTypes.shape({
        terminalId: PropTypes.string.isRequired,
      }).isRequired,
    ]).isRequired,
  };

  state = { date: this.props.date };

  componentDidMount() {
    this.props.relay.refetch({
      stopId: this.props.params.stopId || this.props.params.terminalId,
      date: this.props.date,
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.params.stopId !== this.props.params.stopId ||
      nextProps.params.terminalId !== this.props.params.terminalId ||
      nextProps.date !== this.props.date
    ) {
      this.setState({ date: this.props.date }, () =>
        nextProps.relay.refetch({
          stopId: nextProps.params.stopId || nextProps.params.terminalId,
          date: this.props.date,
        }),
      );
    }
  }

  onDateChange = ({ target: { value } }) => {
    this.setState({ date: value }, () =>
      this.props.relay.refetch({
        stopId: this.props.params.stopId || this.props.params.terminalId,
        date: value,
      }),
    );
  };

  render() {
    if (!this.props.stop) {
      return <div className="spinner-loader" />;
    }

    return (
      <TimetableContainer
        stop={this.props.stop}
        startDate={this.props.date}
        selectedDate={this.state.date}
        onDateChange={this.onDateChange}
      />
    );
  }
}

const StopPageTimetable = createRefetchContainer(
  connectToStores(StopPageTimetableContainer, [], context => ({
    date: context
      .getStore('TimeStore')
      .getCurrentTime()
      .format('YYYYMMDD'),
  })),
  {
    stop: graphql`
      fragment StopPageTimetable_stop on Stop
        @argumentDefinitions(
          date: { type: "String", defaultValue: "19700101" }
        ) {
        ...TimetableContainer_stop @arguments(date: $date)
      }
    `,
  },
  graphql`
    query StopPageTimetableQuery($stopId: String!, $date: String!) {
      stop(id: $stopId) {
        ...StopPageTimetable_stop @arguments(date: $date)
      }
      station(id: $stopId) {
        ...StopPageTimetable_stop @arguments(date: $date)
      }
    }
  `,
);

export default StopPageTimetable;
