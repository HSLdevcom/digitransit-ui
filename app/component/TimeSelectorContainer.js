import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import { routerShape, locationShape } from 'react-router';
import moment from 'moment';
import { intlShape } from 'react-intl';
import debounce from 'lodash/debounce';
import { route } from '../action/ItinerarySearchActions';

import TimeSelectors from './TimeSelectors';


class TimeSelectorContainer extends Component {
  static contextTypes = {
    intl: intlShape.isRequired,
    location: locationShape.isRequired,
    router: routerShape.isRequired,
    getStore: PropTypes.func.isRequired,
    executeAction: React.PropTypes.func.isRequired,
  };

  static propTypes = {
    serviceTimeRange: React.PropTypes.shape({
      start: React.PropTypes.number.isRequired,
      end: React.PropTypes.number.isRequired,
    }).isRequired,
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
    const range = this.props.serviceTimeRange;
    const now = this.context.getStore('TimeStore').getCurrentTime();
    const MAXRANGE = 30; // limit day selection to sensible range ?
    const START = now.clone().subtract(MAXRANGE, 'd');
    const END = now.clone().add(MAXRANGE, 'd');
    let start = moment.unix(range.start);
    start = moment.min(moment.max(start, START), now); // always include today!
    let end = moment.unix(range.end);
    end = moment.max(moment.min(end, END), now);  // always include today!
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
        label = this.context.intl.formatMessage({ id: 'today', defaultMessage: 'Today' });
      } else if (value === tomorrow) {
        label = this.context.intl.formatMessage({ id: 'tomorrow', defaultMessage: 'Tomorrow' });
      } else {
        label = day.format('dd D.M');
      }
      dates.push(
        <option value={value} key={value} >
          {label}
        </option>,
      );
      day.add(1, 'd');
    } while (value !== endValue);

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
