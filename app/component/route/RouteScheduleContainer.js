import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import RouteScheduleHeader from './RouteScheduleHeader';
import RouteScheduleTripRow from './RouteScheduleTripRow';
import RouteScheduleDateSelect from './RouteScheduleDateSelect';
import moment from 'moment';
import { keyBy, sortBy } from 'lodash';

const DATE_FORMAT = 'YYYYMMDD';
const CURRENT_DATE = moment().format(DATE_FORMAT);

class RouteScheduleContainer extends Component {
  static propTypes = {
    pattern: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
  };

  static contextTypes = {
    getStore: PropTypes.func.isRequired,
    executeAction: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    this.initState(props, true);
    this.onFromSelectChange = this.onFromSelectChange.bind(this);
    this.onToSelectChange = this.onToSelectChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    // If route has not changed, only update trips.
    if (nextProps.relay.route.params.routeId === this.props.relay.route.params.routeId) {
      const trips = this.transformTrips(nextProps.pattern.tripsForDate, this.state.stops);
      this.setState({ ... this.state, trips });
    } else {
      this.initState(nextProps, false);
    }
  }

  onFromSelectChange(event) {
    const from = Number(event.target.value);
    const to = this.state.to > from ? this.state.to : from + 1;
    this.setState({ ... this.state, from, to });
  }

  onToSelectChange(event) {
    const to = Number(event.target.value);
    this.setState({ ... this.state, to });
  }

  getTrips(from, to) {
    const stops = this.state.stops;
    return this.state.trips.map((trip) => {
      const departureTime = this.formatTime(trip.stoptimes[stops[from].id].scheduledDeparture);
      const arrivalTime = this.formatTime(trip.stoptimes[stops[to].id].scheduledArrival);

      return (
        <RouteScheduleTripRow
          key={trip.id}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
        />);
    });
  }

  initState(props, isInitialState) {
    const { stops } = props.pattern;
    const trips = this.transformTrips(props.pattern.tripsForDate, stops);
    const from = 0;
    const to = stops.length - 1;

    if (!isInitialState) {
      this.setState({ stops, trips, from, to, date: this.state.date });
    } else {
      this.state = { stops, trips, from, to, date: moment(CURRENT_DATE, DATE_FORMAT) };
    }
  }

  transformTrips(trips, stops) {
    let transformedTrips = trips.map((trip) => {
      const newTrip = { ... trip };
      newTrip.stoptimes = keyBy(trip.stoptimes, 'stop.id');
      return newTrip;
    });
    transformedTrips = sortBy(transformedTrips,
      trip => trip.stoptimes[stops[0].id].scheduledDeparture);
    return transformedTrips;
  }

  formatTime = (timestamp) => moment(timestamp * 1000).format('HH:mm');

  changeDate = ({ target }) => {
    const date = moment(target.value, DATE_FORMAT);
    // @TODO Could we avoid force fetching here?
    // Using setVariable would not return tripsForDate when the route changed,
    // but the new route had already been fetched.
    this.props.relay.forceFetch({
      serviceDay: date.format(DATE_FORMAT),
    });
    this.setState({ ... this.state, date });
  };

  render() {
    return (
      <div>
        <RouteScheduleDateSelect
          startDate={CURRENT_DATE}
          selectedDate={this.state.date.format(DATE_FORMAT)}
          dateFormat={DATE_FORMAT}
          onDateChange={this.changeDate}
        />
        <RouteScheduleHeader
          stops={this.state.stops}
          from={this.state.from}
          to={this.state.to}
          onFromSelectChange={this.onFromSelectChange}
          onToSelectChange={this.onToSelectChange}
        />
        <div className="route-schedule-list momentum-scroll">
          {this.getTrips(this.state.from, this.state.to)}
        </div>
      </div>);
  }
}

const relayInitialVariables = {
  serviceDay: CURRENT_DATE,
};

export const relayFragment = {
  pattern: () => Relay.QL`
    fragment on Pattern {
      stops {
        id
        name
      }
      tripsForDate(serviceDay: $serviceDay) {
        id
        serviceId
        stoptimes {
          scheduledArrival
          scheduledDeparture
          stop {
            id
          }
        }
      }
    }
  `,
};

export default Relay.createContainer(RouteScheduleContainer, {
  initialVariables: relayInitialVariables,
  fragments: relayFragment,
});

