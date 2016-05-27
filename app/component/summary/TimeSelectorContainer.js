import React, { Component, PropTypes } from 'react';
import { setArriveBy, setSelectedTime } from '../../action/TimeActions';
import moment from 'moment';
import TimeSelectors from './TimeSelectors';

import { intlShape } from 'react-intl';

import debounce from 'lodash/debounce';

class TimeSelectorContainer extends Component {

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  state = { time: this.context.getStore('TimeStore').getSelectedTime() };

  componentDidMount() {
    this.context.getStore('TimeStore').addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    this.context.getStore('TimeStore').removeChangeListener(this.onChange);
  }

  onChange = ({ selectedTime }) => {
    if (selectedTime) {
      this.setState({ time: selectedTime });
    }
  };

  setArriveBy = ({ target }) =>
    this.context.executeAction(setArriveBy, target.value === 'true');

  getDates() {
    const dates = [];
    const date = this.context.getStore('TimeStore').getCurrentTime();

    dates.push(
      <option value={date.format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')} >
        {this.context.intl.formatMessage({ id: 'today', defaultMessage: 'Today' })}
      </option>
    );

    dates.push(
      <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')} >
        {this.context.intl.formatMessage({ id: 'tomorrow', defaultMessage: 'Tomorrow' })}
      </option>
    );

    for (let i = 0; i < 28; i++) {
      dates.push(
        <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>
          {date.format('dd D.M')}
        </option>
      );
    }

    return dates;
  }

  dispatchChangedtime = debounce(
    () => this.context.executeAction(
      setSelectedTime,
      this.state.time,
    ), 500);

  changeTime = ({ target }) => this.setState(
    { time: moment(`${target.value} ${this.state.time.format('YYYY-MM-DD')}`, 'H:m YYYY-MM-DD') },
    this.dispatchChangedtime
  );

  changeDate = ({ target }) => this.setState(
    { time: moment(`${this.state.time.format('H:m')} ${target.value}`, 'H:m YYYY-MM-DD') },
    this.dispatchChangedtime
  );

  render() {
    const arriveBy = this.context.getStore('TimeStore').getArriveBy();
    return (
      <TimeSelectors
        arriveBy={arriveBy}
        time={this.state.time}
        setArriveBy={this.setArriveBy}
        changeTime={this.changeTime}
        changeDate={this.changeDate}
        dates={this.getDates()}
      />
    );
  }
}

export default TimeSelectorContainer;
