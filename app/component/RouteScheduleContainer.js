import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { createRefetchContainer, graphql } from 'react-relay';
import { matchShape } from 'found';
import moment from 'moment';
import connectToStores from 'fluxible-addons-react/connectToStores';
import { intlShape, FormattedMessage } from 'react-intl';
import keyBy from 'lodash/keyBy';
import sortBy from 'lodash/sortBy';

import cx from 'classnames';
import RouteScheduleHeader from './RouteScheduleHeader';
import RouteScheduleTripRow from './RouteScheduleTripRow';
import DateSelect from './DateSelect';
import SecondaryButton from './SecondaryButton';
import Loading from './Loading';
import Icon from './Icon';
import { RealtimeStateType } from '../constants';
import { addAnalyticsEvent } from '../util/analyticsUtils';
import withBreakpoint from '../util/withBreakpoint';

const DATE_FORMAT = 'YYYYMMDD';

const isTripCanceled = trip =>
  trip.stoptimes &&
  Object.keys(trip.stoptimes)
    .map(key => trip.stoptimes[key])
    .every(st => st.realtimeState === RealtimeStateType.Canceled);

class RouteScheduleContainer extends Component {
  static transformTrips(trips, stops) {
    if (trips == null) {
      return null;
    }
    let transformedTrips = trips.map(trip => {
      const newTrip = { ...trip };
      newTrip.stoptimes = keyBy(trip.stoptimes, 'stop.id');
      return newTrip;
    });
    transformedTrips = sortBy(
      transformedTrips,
      trip => trip.stoptimes[stops[0].id].scheduledDeparture,
    );
    return transformedTrips;
  }

  static propTypes = {
    pattern: PropTypes.object.isRequired,
    relay: PropTypes.shape({
      refetch: PropTypes.func.isRequired,
    }).isRequired,
    serviceDay: PropTypes.string.isRequired,
    match: matchShape.isRequired,
    breakpoint: PropTypes.string.isRequired,
  };

  static contextTypes = {
    intl: intlShape.isRequired,
    config: PropTypes.object.isRequired,
  };

  state = {
    from: 0,
    to: this.props.pattern.stops.length - 1,
    serviceDay: this.props.serviceDay,
    hasLoaded: true,
  };

  onFromSelectChange = event => {
    const from = Number(event.target.value);
    this.setState(prevState => {
      const to = prevState.to > from ? prevState.to : from + 1;
      return { ...prevState.state, from, to };
    });
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableStartPoint',
      name: null,
    });
  };

  onToSelectChange = event => {
    const to = Number(event.target.value);
    this.setState(prevState => ({ ...prevState.state, to }));
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableEndPoint',
      name: null,
    });
  };

  getTrips = (from, to) => {
    const { stops } = this.props.pattern;
    const trips = RouteScheduleContainer.transformTrips(
      this.props.pattern.tripsForDate,
      stops,
    );
    if (trips == null) {
      return <Loading />;
    }
    if (trips.length === 0) {
      return (
        <div className="text-center">
          {this.context.intl.formatMessage({
            id: 'no-trips-found',
            defaultMessage: 'No journeys found for the selected date.',
          })}
        </div>
      );
    }
    return trips.map(trip => {
      const fromSt = trip.stoptimes[stops[from].id];
      const toSt = trip.stoptimes[stops[to].id];
      const departureTime = this.formatTime(
        fromSt.serviceDay + fromSt.scheduledDeparture,
      );
      const arrivalTime = this.formatTime(
        toSt.serviceDay + toSt.scheduledArrival,
      );

      return (
        <RouteScheduleTripRow
          key={trip.id}
          departureTime={departureTime}
          arrivalTime={arrivalTime}
          isCanceled={isTripCanceled(trip)}
        />
      );
    });
  };

  formatTime = timestamp => moment(timestamp * 1000).format('HH:mm');

  changeDate = ({ target }) => {
    addAnalyticsEvent({
      category: 'Route',
      action: 'ChangeTimetableDay',
      name: null,
    });
    this.setState(
      {
        serviceDay: target.value,
        hasLoaded: false,
      },
      () =>
        this.props.relay.refetch(
          {
            serviceDay: target.value,
            code: this.props.match.params.patternId,
          },
          null,
          () => this.setState({ hasLoaded: true }),
        ),
    );
  };

  dateForPrinting = () => {
    const selectedDate = moment(this.state.serviceDay);
    return (
      <div className="printable-date-container">
        <div className="printable-date-icon">
          <Icon className="large-icon" img="icon-icon_schedule" />
        </div>
        <div className="printable-date-right">
          <div className="printable-date-header">
            <FormattedMessage id="date" defaultMessage="Date" />
          </div>
          <div className="printable-date-content">
            {moment(selectedDate).format('dd DD.MM.YYYY')}
          </div>
        </div>
      </div>
    );
  };

  openRoutePDF = (e, routePDFUrl) => {
    e.stopPropagation();
    window.open(routePDFUrl);
  };

  printRouteTimetable = e => {
    e.stopPropagation();
    window.print();
  };

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.pattern.code !== this.props.pattern.code) {
      this.setState({
        from: 0,
        to: nextProps.pattern.stops.length - 1,
        serviceDay: nextProps.serviceDay,
      });
    }
  }

  render() {
    const routeIdSplitted = this.props.pattern.route.gtfsId.split(':');

    const routeTimetableHandler =
      this.context.config.timetables &&
      this.context.config.timetables[routeIdSplitted[0]];

    const routeTimetableUrl =
      routeTimetableHandler &&
      this.context.config.URL.ROUTE_TIMETABLES[routeIdSplitted[0]] &&
      routeTimetableHandler.timetableUrlResolver(
        this.context.config.URL.ROUTE_TIMETABLES[routeIdSplitted[0]],
        this.props.pattern.route,
      );

    return (
      <div className="route-schedule-content-wrapper">
        <div className="route-page-action-bar">
          <DateSelect
            startDate={this.props.serviceDay}
            selectedDate={this.state.serviceDay}
            dateFormat={DATE_FORMAT}
            onDateChange={this.changeDate}
          />
          {this.dateForPrinting()}
          <div className="print-button-container">
            {routeTimetableUrl && (
              <SecondaryButton
                ariaLabel="print-timetable"
                buttonName="print-timetable"
                buttonClickAction={e => {
                  this.openRoutePDF(e, routeTimetableUrl);
                  addAnalyticsEvent({
                    category: 'Route',
                    action: 'PrintWeeklyTimetable',
                    name: null,
                  });
                }}
                buttonIcon="icon-icon_print"
                smallSize
              />
            )}
            <SecondaryButton
              ariaLabel="print"
              buttonName="print"
              buttonClickAction={e => {
                this.printRouteTimetable(e);
                addAnalyticsEvent({
                  category: 'Route',
                  action: 'PrintTimetable',
                  name: null,
                });
              }}
              buttonIcon="icon-icon_print"
              smallSize
            />
          </div>
        </div>
        <div
          className={cx('route-alerts-list-wrapper', {
            'bp-large': this.props.breakpoint === 'large',
          })}
        >
          <RouteScheduleHeader
            stops={this.props.pattern.stops}
            from={this.state.from}
            to={this.state.to}
            onFromSelectChange={this.onFromSelectChange}
            onToSelectChange={this.onToSelectChange}
          />
          <div className="route-schedule-list momentum-scroll">
            {this.state.hasLoaded ? (
              this.getTrips(this.state.from, this.state.to)
            ) : (
              <Loading />
            )}
          </div>
        </div>
      </div>
    );
  }
}

const connectedComponent = createRefetchContainer(
  connectToStores(withBreakpoint(RouteScheduleContainer), [], context => ({
    serviceDay: context
      .getStore('TimeStore')
      .getCurrentTime()
      .format(DATE_FORMAT),
  })),
  {
    pattern: graphql`
      fragment RouteScheduleContainer_pattern on Pattern
      @argumentDefinitions(
        serviceDay: { type: "String!", defaultValue: "19700101" }
      ) {
        code
        stops {
          id
          name
        }
        route {
          url
          gtfsId
          shortName
        }
        tripsForDate(serviceDate: $serviceDay) {
          id
          stoptimes: stoptimesForDate(serviceDate: $serviceDay) {
            realtimeState
            scheduledArrival
            scheduledDeparture
            serviceDay
            stop {
              id
            }
          }
        }
      }
    `,
  },
  graphql`
    query RouteScheduleContainerQuery($code: String!, $serviceDay: String!) {
      pattern(id: $code) {
        ...RouteScheduleContainer_pattern @arguments(serviceDay: $serviceDay)
      }
    }
  `,
);

export { connectedComponent as default, RouteScheduleContainer as Component };
