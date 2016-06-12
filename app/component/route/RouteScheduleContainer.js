import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import RouteScheduleHeader from './RouteScheduleHeader';
import RouteScheduleTripRow from './RouteScheduleTripRow';
import RouteScheduleDateSelect from './RouteScheduleDateSelect';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { keyBy, sortBy } from 'lodash';

const DATE_FORMAT = 'YYYYMMDD';

class RouteScheduleContainer extends Component {
  static propTypes = {
    pattern: PropTypes.object.isRequired,
    relay: PropTypes.object.isRequired,
    serviceDay: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.initState(props);
    props.relay.setVariables({ serviceDay: props.serviceDay });
    this.onFromSelectChange = this.onFromSelectChange.bind(this);
    this.onToSelectChange = this.onToSelectChange.bind(this);
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
    const { stops } = this.props.pattern;
    const trips = this.transformTrips(this.props.pattern.tripsForDate, stops);
    if (trips == null) {
      return <div className="spinner-loader" />;
    } else if (trips.length === 0) {
      return <div>No trips available for this day</div>;
    }
    return trips.map((trip) => {
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

  initState(props) {
    const { stops } = props.pattern;
    const from = 0;
    const to = stops.length - 1;

    this.state = { from, to };
  }

  transformTrips(trips, stops) {
    if (trips == null) {
      return null;
    }
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
    // TODO: add setState and a callback that resets the laoding state in oreder to get a spinner.
    this.props.relay.setVariables({
      serviceDay: target.value,
    });
  };

  render() {
    return (
      <div>
        <RouteScheduleDateSelect
          startDate={this.props.serviceDay}
          selectedDate={this.props.relay.variables.serviceDay}
          dateFormat={DATE_FORMAT}
          onDateChange={this.changeDate}
        />
        <RouteScheduleHeader
          stops={this.props.pattern.stops}
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
  serviceDay: '19700101',
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

export default connectToStores(
  Relay.createContainer(RouteScheduleContainer, {
    initialVariables: relayInitialVariables,
    fragments: relayFragment,
  }), [], (context) => ({
    serviceDay: context.getStore('TimeStore').getCurrentTime().format(DATE_FORMAT),
  }));
