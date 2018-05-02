import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
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
    time: PropTypes.number.isRequired,
    arriveBy: PropTypes.string.isRequired,
    now: PropTypes.shape({}).isRequired,
  };

  getDates() {
    const MAXRANGE = 30; // limit day selection to sensible range ?
    const dates = [];
    const range = this.props.serviceTimeRange;
    const { now } = this.props;
    const START = now.clone().subtract(MAXRANGE, 'd');
    const END = now.clone().add(MAXRANGE, 'd');
    let start = moment.unix(range.start);
    start = moment.min(moment.max(start, START), now); // always include today!
    let end = moment.unix(range.end);
    end = moment.max(moment.min(end, END), now); // always include today!
    end = end.endOf('day'); // make sure last day is included, while is comparing timestamps
    const tomorrow = now.clone().add(1, 'd');
    const endValue = end.unix();
    start.hours(this.props.time.hours());
    start.minutes(this.props.time.minutes());
    start.seconds(this.props.time.seconds());

    let value;
    const day = start;
    do {
      let label;
      value = `${day.unix()}`;
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
      time.add(add.key, add.delta);
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

const withLocation = getContext({
  location: locationShape.isRequired,
})(withNow);

export default Relay.createContainer(withLocation, {
  fragments: {
    serviceTimeRange: () => Relay.QL`
      fragment on serviceTimeRange {
        start
        end
      }
    `,
  },
});
