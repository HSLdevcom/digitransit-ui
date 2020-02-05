import React from 'react';
import PropTypes from 'prop-types';
import { createRefetchContainer, graphql } from 'react-relay/compat';
import moment from 'moment';

import { prepareServiceDay } from '../util/dateParamUtils';
import TimetableContainer from './TimetableContainer';

const initialDate = moment().format('YYYYMMDD');

class TimetablePage extends React.Component {
  static propTypes = {
    stop: PropTypes.shape({
      url: PropTypes.string,
    }).isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
  };

  state = prepareServiceDay({});

  onDateChange = ({ target }) => {
    this.props.relay.refetch(
      {
        date: target.value,
      },
      null,
      () => this.setState({ date: target.value }),
    );
  };

  render() {
    return (
      <TimetableContainer
        stop={this.props.stop}
        date={this.state.date}
        propsForStopPageActionBar={{
          startDate: initialDate,
          selectedDate: this.state.date,
          onDateChange: this.onDateChange,
        }}
      />
    );
  }
}

export default createRefetchContainer(TimetablePage, {
  stop: graphql`
    fragment TimetablePage_stop on Stop
      @argumentDefinitions(date: { type: "String" }) {
      url
      ...TimetableContainer_stop @arguments(date: $date)
    }
  `,
});
