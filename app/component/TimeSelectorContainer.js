import React, { Component, PropTypes } from 'react';
import moment from 'moment';
import { intlShape } from 'react-intl';
import debounce from 'lodash/debounce';
import { route } from '../action/ItinerarySearchActions';

import TimeSelectors from './TimeSelectors';


class TimeSelectorContainer extends Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    location: PropTypes.object.isRequired,
    router: PropTypes.object.isRequired,
    getStore: PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  };

  state = { time: this.context.location.query.time ?
    moment(this.context.location.query.time * 1000) :
    moment(),
  };

  componentDidMount() {
    this.context.router.listen(location =>
      location.query.time && Number(location.query.time) !== this.state.time.unix() &&
        this.setState({ time: moment(location.query.time * 1000) }),
    );
  }

  setArriveBy = ({ target }) =>
    this.context.executeAction(
      route,
      {
        location: {
          ...this.context.location,
          query: {
            ...this.context.location.query,
            arriveBy: target.value,
          },
        },
        router: this.context.router,
      },
    );

  getDates() {
    const dates = [];
    const date = this.context.getStore('TimeStore').getCurrentTime();

    dates.push(
      <option value={date.format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')} >
        {this.context.intl.formatMessage({ id: 'today', defaultMessage: 'Today' })}
      </option>,
    );

    dates.push(
      <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')} >
        {this.context.intl.formatMessage({ id: 'tomorrow', defaultMessage: 'Tomorrow' })}
      </option>,
    );

    for (let i = 0; i < 28; i++) {
      dates.push(
        <option value={date.add(1, 'd').format('YYYY-MM-DD')} key={date.format('YYYY-MM-DD')}>
          {date.format('dd D.M')}
        </option>,
      );
    }

    return dates;
  }

  dispatchChangedtime = debounce(
    () =>
      this.context.executeAction(
        route,
        {
          location: {
            ...this.context.location,
            query: {
              ...this.context.location.query,
              time: this.state.time.unix(),
            },
          },
          router: this.context.router,
        },
      ),
    500);

  changeTime = ({ target }) => (target.value ? this.setState(
    { time: moment(`${target.value} ${this.state.time.format('YYYY-MM-DD')}`, 'H:m YYYY-MM-DD') },
    this.dispatchChangedtime,
  ) : {});

  changeDate = ({ target }) => this.setState(
    { time: moment(`${this.state.time.format('H:m')} ${target.value}`, 'H:m YYYY-MM-DD') },
    this.dispatchChangedtime,
  );

  render() {
    return (
      <TimeSelectors
        arriveBy={this.context.location.query.arriveBy === 'true'}
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
