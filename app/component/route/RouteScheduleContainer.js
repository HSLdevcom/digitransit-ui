import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import RouteScheduleHeader from './RouteScheduleHeader';
import RouteScheduleTripRow from './RouteScheduleTripRow';
import moment from 'moment';
import { keyBy, sortBy, uniqBy } from 'lodash';


class RouteScheduleContainer extends Component {
  static propTypes = {
    pattern: PropTypes.object.isRequired,
  };

  constructor(props) {
    super();
    this.initState(props, false);
    this.onFromSelectChange = this.onFromSelectChange.bind(this);
    this.onToSelectChange = this.onToSelectChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.initState(nextProps, true);
  }

  onFromSelectChange(event) {
    const from = Number(event.target.value);
    const to = this.state.to > from ? this.state.to : from + 1;
    this.setState(Object.assign({}, this.state, { from, to }));
  }

  onToSelectChange(event) {
    const to = Number(event.target.value);
    this.setState(Object.assign({}, this.state, { to }));
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

  initState(props, isUpdate) {
    const { stops } = props.pattern;
    // Transform trips for now, until GraphQL endpoint is updated.
    const trips = this.transformTrips(props.pattern.trips, stops);
    const from = 0;
    const to = stops.length - 1;
    const state = { stops, trips, from, to };
    if (isUpdate) {
      this.setState(state);
    } else {
      this.state = state;
    }
  }

  transformTrips(trips, stops) {
    let transformedTrips = trips.map((trip) => {
      const newTrip = Object.assign({}, trip);
      newTrip.stoptimes = keyBy(trip.stoptimes, 'stop.id');
      return newTrip;
    });
    transformedTrips = uniqBy(transformedTrips,
      trip => trip.stoptimes[stops[0].id].scheduledDeparture);
    transformedTrips = sortBy(transformedTrips,
      trip => trip.stoptimes[stops[0].id].scheduledDeparture);
    return transformedTrips;
  }

  formatTime(timestamp) {
    return moment(timestamp * 1000).format('HH:mm');
  }

  render() {
    return (
      <div>
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

export const relayFragment = {
  pattern: () => Relay.QL`
    fragment on Pattern {
      stops {
        id
        name
      }
      trips {
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

export default Relay.createContainer(RouteScheduleContainer, { fragments: relayFragment });

