import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { routerShape, locationShape } from 'react-router';
import moment from 'moment';
import { intlShape } from 'react-intl';
import get from 'lodash/get';
import debounce from 'lodash/debounce';
import getContext from 'recompose/getContext';
import withProps from 'recompose/withProps';
import connectToStores from 'fluxible-addons-react/connectToStores';

import TimeSelectors from './TimeSelectors';

class TimeSelectorContainer extends Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    router: routerShape.isRequired,
    location: locationShape.isRequired,
  };

  static propTypes = {
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
    time: PropTypes.instanceOf(moment).isRequired,
    arriveBy: PropTypes.string.isRequired,
    now: PropTypes.shape({}).isRequired,
  };

  getDates() {
    const dates = [];
    const { now } = this.props;
    const start = moment.unix(this.props.serviceTimeRange.start);
    const end = moment.unix(this.props.serviceTimeRange.end);

    const tomorrow = now.clone().add(1, 'd');
    const endValue = end.unix();
    start.hours(this.props.time.hours());
    start.minutes(this.props.time.minutes());
    start.seconds(this.props.time.seconds());

    const day = start;
    let value = `${day.unix()}`;
    do {
      let label;
      if (day.isSame(now, 'day')) {
        label = this.context.intl.formatMessage({
          id: 'today',
          defaultMessage: 'Today',
        });
      } else if (day.isSame(tomorrow, 'day')) {
        label = this.context.intl.formatMessage({
          id: 'tomorrow',
          defaultMessage: 'Tomorrow',
        });
      } else {
        label = day.format('dd D.M');
      }
      dates.push(
        <option value={value} key={value}>
          {label}
        </option>,
      );
      day.add(1, 'd');
      value = `${day.unix()}`;
    } while (value <= endValue);

    return dates;
  }

  setArriveBy = ({ target }) => {
    const arriveBy = target.value;
    this.context.router.replace({
      pathname: this.context.location.pathname,
      query: {
        ...this.context.location.query,
        arriveBy,
      },
    });
  };

  setTime = debounce(newTime => {
    this.context.router.replace({
      pathname: this.context.location.pathname,
      query: {
        ...this.context.location.query,
        time: newTime.unix(),
      },
    });
  }, 10);

  changeTime = ({ hours, minutes, add }) => {
    const time = this.props.time.clone();
    if (add) {
      // delta from arrow keys
      time.add(add.delta, add.key);
    } else {
      time.hours(hours);
      time.minutes(minutes);
    }
    this.setTime(time);
  };

  changeDate = ({ target }) => {
    const time = moment.unix(parseInt(target.value, 10));
    this.setTime(time);
  };

  render() {
    return (
      <TimeSelectors
        arriveBy={this.props.arriveBy}
        time={this.props.time}
        setArriveBy={this.setArriveBy}
        changeTime={this.changeTime}
        changeDate={this.changeDate}
        dates={this.getDates()}
      />
    );
  }
}

const TSCWithProps = withProps(({ location, now }, ...rest) => ({
  ...rest,
  time: location.query.time
    ? moment.unix(parseInt(location.query.time, 10))
    : now,
  arriveBy: get(location, 'query.arriveBy', 'false'),
}))(TimeSelectorContainer);

const withNow = connectToStores(TSCWithProps, ['TimeStore'], context => ({
  now: context.getStore('TimeStore').getCurrentTime(),
}));

export default getContext({
  location: locationShape.isRequired,
})(withNow);
