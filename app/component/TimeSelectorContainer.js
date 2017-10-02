import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Relay from 'react-relay/classic';
import { routerShape, locationShape } from 'react-router';
import moment from 'moment';
import { intlShape } from 'react-intl';
import debounce from 'lodash/debounce';

import TimeSelectors from './TimeSelectors';

class TimeSelectorContainer extends Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  static propTypes = {
    serviceTimeRange: PropTypes.shape({
      start: PropTypes.number.isRequired,
      end: PropTypes.number.isRequired,
    }).isRequired,
  };

  state = {
    time: this.context.location.query.time
      ? moment.unix(this.context.location.query.time)
      : moment(),
    arriveBy: this.context.location.query.arriveBy === 'true',
    setTimefromProps: false,
  };

  componentDidMount() {
    this.context.router.listen(location => {
      if (
        location.query.time &&
        Number(location.query.time) !== this.state.time.unix() &&
        (location.query.arriveBy === 'true') === this.state.arriveBy
      ) {
        this.setState({ time: moment.unix(location.query.time) });
      } else if ((location.query.arriveBy === 'true') !== this.state.arriveBy) {
        this.setState({ setTimefromProps: true });
      }
    });
  }

  componentWillReceiveProps(newProps) {
    if (this.state.setTimefromProps && newProps.startTime && newProps.endTime) {
      this.setState({
        time: moment(
          this.state.arriveBy ? newProps.endTime : newProps.startTime,
        ),
        setTimefromProps: false,
      });
    }
  }

  setArriveBy = ({ target }) => {
    // TODO is state manipulation here necessary or could we get it from url...
    this.setState({ arriveBy: target.value === 'true' }, () => {
      this.context.router.replace({
        pathname: this.context.location.pathname,
        query: {
          ...this.context.location.query,
          arriveBy: target.value,
        },
      });
    });
  };

  getDates() {
    const dates = [];
    const range = this.props.serviceTimeRange;
    const now = this.context.getStore('TimeStore').getCurrentTime();
    const MAXRANGE = 30; // limit day selection to sensible range ?
    const START = now.clone().subtract(MAXRANGE, 'd');
    const END = now.clone().add(MAXRANGE, 'd');
    let start = moment.unix(range.start);
    start = moment.min(moment.max(start, START), now); // always include today!
    let end = moment.unix(range.end);
    end = moment.max(moment.min(end, END), now); // always include today!
    const dayform = 'YYYY-MM-DD';
    const today = now.format(dayform);
    const tomorrow = now.add(1, 'd').format(dayform);
    const endValue = end.format(dayform);

    let value;
    const day = start;
    do {
      let label;
      value = day.format(dayform);
      if (value === today) {
        label = this.context.intl.formatMessage({
          id: 'today',
          defaultMessage: 'Today',
        });
      } else if (value === tomorrow) {
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
    } while (value !== endValue);

    return dates;
  }

  dispatchChangedtime = debounce(() => {
    this.context.router.replace({
      pathname: this.context.location.pathname,
      query: {
        ...this.context.location.query,
        time: this.state.time.unix(),
        arriveBy: this.state.arriveBy,
      },
    });
  }, 500);

  changeTime = ({ target }, callback) =>
    target.value
      ? this.setState(
          {
            time: moment(
              `${target.value} ${this.state.time.format('YYYY-MM-DD')}`,
              'H:m YYYY-MM-DD',
            ),
            setTimefromProps: false,
          },
          () => {
            if (typeof callback === 'function') {
              callback();
            }
            this.dispatchChangedtime();
          },
        )
      : {};

  changeDate = ({ target }) =>
    this.setState(
      {
        time: moment(
          `${this.state.time.format('H:m')} ${target.value}`,
          'H:m YYYY-MM-DD',
        ),
        setTimefromProps: false,
      },
      this.dispatchChangedtime,
    );

  render() {
    return (
      <TimeSelectors
        arriveBy={this.state.arriveBy}
        time={this.state.time}
        setArriveBy={this.setArriveBy}
        changeTime={this.changeTime}
        changeDate={this.changeDate}
        dates={this.getDates()}
      />
    );
  }
}

export default Relay.createContainer(TimeSelectorContainer, {
  fragments: {
    serviceTimeRange: () => Relay.QL`
      fragment on serviceTimeRange {
        start
        end
      }
    `,
  },
});
