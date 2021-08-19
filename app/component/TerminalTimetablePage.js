import React from 'react';
import PropTypes from 'prop-types';
import { createRefetchContainer, graphql } from 'react-relay';
import moment from 'moment';

import { prepareServiceDay } from '../util/dateParamUtils';
import TimetableContainer from './TimetableContainer';

const initialDate = moment().format('YYYYMMDD');

class TerminalTimetablePage extends React.Component {
  static propTypes = {
    station: PropTypes.shape({
      url: PropTypes.string,
    }).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = prepareServiceDay({});

  onDateChange = value => {
    this.props.relay.refetch(
      {
        date: value,
      },
      null,
      () => this.setState({ date: value }),
    );
  };

  render() {
    return (
      <TimetableContainer
        stop={this.props.station}
        date={this.state.date}
        propsForDateSelect={{
          startDate: initialDate,
          selectedDate: this.state.date,
          onDateChange: this.onDateChange,
        }}
      />
    );
  }
}

export default createRefetchContainer(
  TerminalTimetablePage,
  {
    station: graphql`
      fragment TerminalTimetablePage_station on Stop
      @argumentDefinitions(date: { type: "String" }) {
        url
        ...TimetableContainer_stop @arguments(date: $date)
      }
    `,
  },
  graphql`
    query TerminalTimetablePageQuery($terminalId: String!, $date: String) {
      station(id: $terminalId) {
        ...TerminalTimetablePage_station @arguments(date: $date)
      }
    }
  `,
);
