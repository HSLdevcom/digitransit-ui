import React from 'react';
import PropTypes from 'prop-types';
import { createRefetchContainer, graphql } from 'react-relay';
import moment from 'moment';

import { matchShape, routerShape } from 'found';
import { prepareServiceDay } from '../util/dateParamUtils';
import TimetableContainer from './TimetableContainer';

const initialDate = moment().format('YYYYMMDD');

class StopTimetablePage extends React.Component {
  static propTypes = {
    stop: PropTypes.shape({
      url: PropTypes.string,
    }).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = prepareServiceDay({});

  componentDidMount() {
    const { match } = this.context;
    const { query } = match.location;

    const dateFromQuery = query.date;
    if (dateFromQuery) {
      this.setState({ date: dateFromQuery });
    }
  }

  onDateChange = value => {
    this.props.relay.refetch(
      {
        date: value,
      },
      null,
      () => this.setState({ date: value }),
    );
  };

  static contextTypes = {
    router: routerShape.isRequired,
    match: matchShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  render() {
    return (
      <TimetableContainer
        stop={this.props.stop}
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
  StopTimetablePage,
  {
    stop: graphql`
      fragment StopTimetablePage_stop on Stop
      @argumentDefinitions(date: { type: "String" }) {
        url
        ...TimetableContainer_stop @arguments(date: $date)
      }
    `,
  },
  graphql`
    query StopTimetablePageQuery($stopId: String!, $date: String) {
      stop(id: $stopId) {
        ...StopTimetablePage_stop @arguments(date: $date)
      }
    }
  `,
);
