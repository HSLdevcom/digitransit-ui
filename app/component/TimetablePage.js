import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import moment from 'moment';

import TimetableContainer from './TimetableContainer';

const initialDate = moment().format('YYYYMMDD');

class TimetablePage extends React.Component {
  static propTypes = {
    stop: PropTypes.shape({
      url: PropTypes.string,
    }).isRequired,
    relay: PropTypes.shape({
      variables: PropTypes.shape({
        date: PropTypes.string.isRequired,
      }).isRequired,
      setVariables: PropTypes.func.isRequired,
    }).isRequired,
  };

  onDateChange = ({ target }) => {
    this.props.relay.setVariables({ date: target.value });
  };

  render() {
    return (
      <TimetableContainer
        stop={this.props.stop}
        date={this.props.relay.variables.date}
        propsForStopPageActionBar={{
          startDate: initialDate,
          selectedDate: this.props.relay.variables.date,
          onDateChange: this.onDateChange,
        }}
      />
    );
  }
}

export default Relay.createContainer(TimetablePage, {
  fragments: {
    stop: ({ date }) => Relay.QL`
      fragment on Stop {
        url
        ${TimetableContainer.getFragment('stop', { date })}
      }
    `,
  },
  initialVariables: {
    date: initialDate,
  },
});
