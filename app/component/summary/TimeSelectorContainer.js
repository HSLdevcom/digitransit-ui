import React from 'react';
import TimeActions from '../../action/time-action';
import moment from 'moment';
import TimeSelectors from './TimeSelectors';

import { intlShape } from 'react-intl';

import debounce from 'lodash/debounce';

class TimeSelectorContainer extends React.Component {
  static contextTypes = {
    getStore: React.PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  constructor(props, context) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.changeTime = this.changeTime.bind(this);
    this.changeDate = this.changeDate.bind(this);
    this.setArriveBy = this.setArriveBy.bind(this);
    this.state = {
      time: context.getStore('TimeStore').getSelectedTime(),
    };
    this.dispatchChangedtime = debounce(
      () => this.context.executeAction(
        TimeActions.setSelectedTime,
        this.state.time,
      ), 500);
  }

  componentDidMount() {
    return this.context.getStore('TimeStore').addChangeListener(this.onChange);
  }

  componentWillUnmount() {
    return this.context.getStore('TimeStore').removeChangeListener(this.onChange);
  }

  onChange({ selectedTime }) {
    return this.setState({ time: selectedTime });
  }

  setArriveBy(event) {
    return this.context.executeAction(TimeActions.setArriveBy, event.target.value === 'true');
  }

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

    Array.from(Array(28).keys()).forEach(() =>
      dates.push(
        <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>
          {date.format('dd D.M')}
        </option>
      )
    );

    return dates;
  }

  changeTime(event) {
    this.setState(
      {
        time: moment(
          `${event.target.value} ${this.state.time.format('YYYY-MM-DD')}`,
          'H:m YYYY-MM-DD'
        ),
      },
      this.dispatchChangedtime
    );
  }

  changeDate(event) {
    this.setState(
      {
        time: moment(
          `${this.state.time.format('H:m')} ${event.target.value}`,
          'H:m YYYY-MM-DD'
        ),
      },
      this.dispatchChangedtime
    );
  }

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
